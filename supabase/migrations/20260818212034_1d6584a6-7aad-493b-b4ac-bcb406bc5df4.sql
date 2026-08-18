
-- ROLES
CREATE TYPE public.app_role AS ENUM ('admin','editor');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT 'Youth Club Staff',
  avatar_url text,
  bio text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_public_read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_self_insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_self_update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','editor'));
$$;

CREATE POLICY "user_roles_self_read" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

-- new user bootstrap: profile + first user becomes admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)),
    NEW.raw_user_meta_data->>'avatar_url'
  ) ON CONFLICT (id) DO NOTHING;

  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin') ON CONFLICT DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'editor') ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- CATEGORIES
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  color text NOT NULL DEFAULT '#C1121F',
  icon text NOT NULL DEFAULT 'Newspaper',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories_public_read" ON public.categories FOR SELECT USING (true);
CREATE POLICY "categories_staff_write" ON public.categories FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- TAGS
CREATE TABLE public.tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.tags TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tags TO authenticated;
GRANT ALL ON public.tags TO service_role;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tags_public_read" ON public.tags FOR SELECT USING (true);
CREATE POLICY "tags_staff_write" ON public.tags FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- POSTS
CREATE TABLE public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text,
  slug text NOT NULL UNIQUE,
  excerpt text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  featured_image text,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name text NOT NULL DEFAULT 'Youth Club Editorial',
  author_avatar text,
  status text NOT NULL DEFAULT 'draft',
  is_featured boolean NOT NULL DEFAULT false,
  reading_time integer NOT NULL DEFAULT 3,
  seo_description text,
  view_count integer NOT NULL DEFAULT 0,
  like_count integer NOT NULL DEFAULT 0,
  published_at timestamptz,
  scheduled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT posts_status_check CHECK (status IN ('draft','published'))
);
CREATE INDEX posts_status_published_idx ON public.posts (status, published_at DESC);
GRANT SELECT ON public.posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.posts TO authenticated;
GRANT ALL ON public.posts TO service_role;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "posts_public_read_published" ON public.posts FOR SELECT USING (status = 'published');
CREATE POLICY "posts_staff_read_all" ON public.posts FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "posts_staff_write" ON public.posts FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER posts_touch BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- POST TAGS
CREATE TABLE public.post_tags (
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);
GRANT SELECT ON public.post_tags TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.post_tags TO authenticated;
GRANT ALL ON public.post_tags TO service_role;
ALTER TABLE public.post_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "post_tags_public_read" ON public.post_tags FOR SELECT USING (true);
CREATE POLICY "post_tags_staff_write" ON public.post_tags FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- LIKES
CREATE TABLE public.post_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  visitor_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (post_id, visitor_id)
);
CREATE INDEX post_likes_post_idx ON public.post_likes (post_id);
GRANT SELECT, INSERT, DELETE ON public.post_likes TO anon;
GRANT SELECT, INSERT, DELETE ON public.post_likes TO authenticated;
GRANT ALL ON public.post_likes TO service_role;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "post_likes_public_read" ON public.post_likes FOR SELECT USING (true);
CREATE POLICY "post_likes_public_insert" ON public.post_likes FOR INSERT WITH CHECK (
  length(visitor_id) BETWEEN 8 AND 64
  AND EXISTS (SELECT 1 FROM public.posts p WHERE p.id = post_id AND p.status = 'published')
);
CREATE POLICY "post_likes_public_delete" ON public.post_likes FOR DELETE USING (true);

CREATE OR REPLACE FUNCTION public.sync_like_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSE
    UPDATE public.posts SET like_count = GREATEST(like_count - 1, 0) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
END; $$;
CREATE TRIGGER post_likes_sync AFTER INSERT OR DELETE ON public.post_likes
FOR EACH ROW EXECUTE FUNCTION public.sync_like_count();

-- VIEWS
CREATE TABLE public.post_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  visitor_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX post_views_post_idx ON public.post_views (post_id, created_at DESC);
GRANT SELECT, INSERT ON public.post_views TO anon;
GRANT SELECT, INSERT ON public.post_views TO authenticated;
GRANT ALL ON public.post_views TO service_role;
ALTER TABLE public.post_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "post_views_public_read" ON public.post_views FOR SELECT USING (true);
CREATE POLICY "post_views_public_insert" ON public.post_views FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.posts p WHERE p.id = post_id AND p.status = 'published')
);

CREATE OR REPLACE FUNCTION public.sync_view_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.posts SET view_count = view_count + 1 WHERE id = NEW.post_id;
  RETURN NEW;
END; $$;
CREATE TRIGGER post_views_sync AFTER INSERT ON public.post_views
FOR EACH ROW EXECUTE FUNCTION public.sync_view_count();

-- EVENTS
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  event_date timestamptz NOT NULL,
  venue text NOT NULL DEFAULT 'Youth Club Hall',
  image_url text,
  registration_url text,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.events TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "events_public_read" ON public.events FOR SELECT USING (is_published = true);
CREATE POLICY "events_staff_read" ON public.events FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "events_staff_write" ON public.events FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER events_touch BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- NEWSLETTER
CREATE TABLE public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.newsletter_subscribers TO anon;
GRANT SELECT, INSERT, DELETE ON public.newsletter_subscribers TO authenticated;
GRANT ALL ON public.newsletter_subscribers TO service_role;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "newsletter_public_insert" ON public.newsletter_subscribers FOR INSERT
  WITH CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' AND length(email) <= 255);
CREATE POLICY "newsletter_staff_read" ON public.newsletter_subscribers FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));
CREATE POLICY "newsletter_staff_delete" ON public.newsletter_subscribers FOR DELETE TO authenticated
  USING (public.is_staff(auth.uid()));

-- SEED CATEGORIES
INSERT INTO public.categories (name, slug, description, color, icon) VALUES
('Announcements','announcements','Official notices from the youth club leadership.','#C1121F','Megaphone'),
('Community Projects','community-projects','Initiatives that improve our neighbourhood.','#0F766E','HeartHandshake'),
('Youth Development','youth-development','Programmes that grow skills and confidence.','#7C3AED','Sprout'),
('Leadership','leadership','Training and stories about leading well.','#B45309','Crown'),
('Volunteer Activities','volunteer-activities','Ways to give your time and talent.','#2563EB','HandHeart'),
('Workshops','workshops','Hands-on sessions and bootcamps.','#DB2777','Wrench'),
('Success Stories','success-stories','Members whose journeys inspire us.','#16A34A','Trophy'),
('Health Awareness','health-awareness','Physical and mental wellbeing.','#0891B2','HeartPulse'),
('Education','education','Scholarships, study support and learning.','#4F46E5','GraduationCap'),
('Sports','sports','Fixtures, festivals and fitness.','#EA580C','Medal');

INSERT INTO public.tags (name, slug) VALUES
('Community','community'),('Environment','environment'),('Leadership','leadership'),
('Mental Health','mental-health'),('Technology','technology'),('Volunteering','volunteering'),
('Careers','careers'),('Scholarships','scholarships'),('Sports','sports'),
('Wellbeing','wellbeing'),('Training','training'),('Innovation','innovation'),
('Teamwork','teamwork'),('Youth Voice','youth-voice'),('Outreach','outreach'),
('Mentorship','mentorship'),('Education','education'),('Events','events');

-- SEED POSTS
INSERT INTO public.posts (title, subtitle, slug, excerpt, content, featured_image, category_id, author_name, status, is_featured, reading_time, seo_description, view_count, like_count, published_at) VALUES
('Community Clean-Up Campaign Transforms Riverside Park','Over 180 volunteers turned a neglected riverbank into a green public space in a single weekend.','community-clean-up-campaign','What began as a small Saturday morning idea grew into the largest volunteer turnout in our club''s history, with 180 young people clearing 2.4 tonnes of waste from Riverside Park.','<p>What began as a small Saturday morning idea grew into the largest volunteer turnout in our club''s history. Over two days, <strong>180 young people</strong> cleared 2.4 tonnes of waste from Riverside Park, planted 60 native saplings and repainted the community benches.</p><h2>How it came together</h2><p>The campaign was proposed at our monthly members'' forum by three secondary school members who walk past the park daily. Within a fortnight they had a plan, a risk assessment and a partnership with the district environmental office.</p><blockquote>We stopped complaining about the park and started owning it. That shift is what the club teaches you.</blockquote><h2>What happens next</h2><ul><li>A monthly maintenance rota staffed by member volunteers</li><li>Two new recycling stations funded by local businesses</li><li>An outdoor reading corner opening next term</li></ul><p>If you would like to join the maintenance rota, sign up at the front desk or through the volunteer page.</p>','https://images.unsplash.com/photo-1618477388954-7852f32655ec?auto=format&fit=crop&w=1600&q=80',(SELECT id FROM public.categories WHERE slug='community-projects'),'Amara Okonkwo','published',true,5,'How 180 youth club volunteers transformed Riverside Park in a single weekend clean-up campaign.',1284,213,now() - interval '3 days'),
('Youth Leadership Conference Draws Record Attendance','Three days of workshops, keynotes and peer mentoring for the next generation of community leaders.','youth-leadership-conference','Our annual leadership conference welcomed 420 delegates from 26 partner clubs for three days of practical training in public speaking, project design and ethical decision making.','<p>Our annual Youth Leadership Conference welcomed <strong>420 delegates</strong> from 26 partner clubs. The theme this year was <em>Lead Where You Are</em>.</p><h2>Highlights</h2><p>Delegates rotated through practical labs on public speaking, project design, budgeting and ethical decision making. The closing panel brought together four alumni now working in local government, healthcare, tech and education.</p><h3>Delegate feedback</h3><ul><li>96% rated the practical labs as excellent</li><li>78% left with a written community project plan</li><li>41 delegates signed up as club mentors</li></ul><p>Applications for next year''s cohort open in March.</p>','https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=80',(SELECT id FROM public.categories WHERE slug='leadership'),'Daniel Mensah','published',true,6,'Record attendance at the Youth Club Leadership Conference with 420 delegates from 26 partner clubs.',2043,318,now() - interval '9 days'),
('Digital Skills Bootcamp: 12 Weeks, 60 Graduates','A free, intensive programme teaching web development, data literacy and digital safety.','digital-skills-bootcamp','Sixty members completed our twelve-week digital skills bootcamp, building real websites for local businesses as their final projects.','<p>Sixty members completed our twelve-week Digital Skills Bootcamp this term. The curriculum covered web fundamentals, spreadsheets and data literacy, digital safety and an introduction to programming.</p><h2>Real projects, real clients</h2><p>Instead of a written exam, every participant built a working website for a local business or community group. Fourteen of those sites are now live.</p><h2>Equipment and access</h2><p>Thanks to a donation of 25 refurbished laptops, no participant had to bring their own device. Evening sessions were streamed for members who could not attend in person.</p><p>The next cohort begins after the mid-term break. Priority is given to members who have not attended a technical programme before.</p>','https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80',(SELECT id FROM public.categories WHERE slug='workshops'),'Grace Adeyemi','published',true,4,'Sixty youth club members graduate from a free twelve-week digital skills bootcamp.',1567,241,now() - interval '14 days'),
('Mental Health Awareness Week: Breaking the Silence','A week of open conversations, counsellor drop-ins and peer support training.','mental-health-awareness-week','More than 300 members took part in Mental Health Awareness Week, and 34 trained as peer support listeners.','<p>Mental Health Awareness Week is now the most attended non-sporting event in our calendar. This year more than <strong>300 members</strong> took part.</p><h2>What we ran</h2><ul><li>Daily counsellor drop-in clinics, no appointment needed</li><li>Peer support listener training for 34 members</li><li>Two evening sessions for parents and guardians</li><li>A quiet room that will now stay open permanently</li></ul><h2>Why it matters</h2><p>In our anonymous member survey, 61% said they had felt overwhelmed in the past three months but only 19% had spoken to anyone about it. Closing that gap is the point of the week.</p><p>Support does not end with the week. The counsellor clinic continues every Wednesday evening.</p>','https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=1600&q=80',(SELECT id FROM public.categories WHERE slug='health-awareness'),'Chidinma Eze','published',true,5,'Mental Health Awareness Week at the Youth Club: counsellor clinics, peer training and open conversations.',1892,287,now() - interval '6 days'),
('Volunteer Spotlight: Meet Tobi, 400 Hours and Counting','From shy new member to the coordinator of our Saturday tutoring programme.','volunteer-spotlight-tobi','Tobi joined the club three years ago and barely spoke. Today he coordinates a tutoring programme that serves 90 primary school pupils every Saturday.','<p>Tobi joined the club three years ago and, by his own admission, barely spoke for the first two months. Today he coordinates a tutoring programme serving <strong>90 primary school pupils</strong> every Saturday.</p><h2>How it started</h2><p>He volunteered to carry chairs. Then to mark attendance. Then to tutor one pupil in maths. Three years and 400 logged volunteer hours later, he manages a team of 18 tutors.</p><blockquote>Nobody handed me a title. I just kept showing up, and eventually showing up became the job.</blockquote><h2>His advice to new members</h2><p>Start with the unglamorous task. It is where you learn how the place actually works.</p>','https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&w=1600&q=80',(SELECT id FROM public.categories WHERE slug='success-stories'),'Amara Okonkwo','published',false,4,'Volunteer spotlight on Tobi, who grew from a quiet new member into a tutoring programme coordinator.',976,164,now() - interval '20 days'),
('Career Development Workshop Series Returns This Term','CV clinics, mock interviews and employer sessions across six weeks.','career-development-workshop-series','Our career series returns with CV clinics, mock interviews and eight visiting employers offering real internship placements.','<p>The Career Development Workshop Series returns for a sixth year, running every Thursday evening for six weeks.</p><h2>The schedule</h2><ol><li>Week 1 — Understanding your strengths</li><li>Week 2 — CV and cover letter clinic</li><li>Week 3 — Interview practice with real recruiters</li><li>Week 4 — Digital presence and professional networks</li><li>Week 5 — Employer showcase evening</li><li>Week 6 — Application sprint and follow-up</li></ol><h2>Employer partners</h2><p>Eight employers across healthcare, logistics, software and the public sector will attend the showcase, and five are offering internship placements exclusively to attendees.</p><p>Places are limited to 60. Register at reception.','https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1600&q=80',(SELECT id FROM public.categories WHERE slug='youth-development'),'Daniel Mensah','published',false,4,'A six-week career development workshop series with CV clinics, mock interviews and employer partners.',744,98,now() - interval '11 days'),
('Environmental Sustainability Project Wins Regional Award','Our rooftop garden and rainwater harvesting scheme recognised at the regional youth awards.','environmental-sustainability-project','The club''s rooftop garden and rainwater harvesting system took first place in the regional Youth Green Innovation Awards.','<p>The club''s rooftop garden and rainwater harvesting system has taken first place in the regional <strong>Youth Green Innovation Awards</strong>.</p><h2>The project</h2><p>Designed and built by a team of eleven members over eight months, the system collects roof runoff into two 1,000-litre tanks that irrigate 40 square metres of vegetable beds.</p><h2>By the numbers</h2><ul><li>68,000 litres of rainwater harvested in the first year</li><li>310 kg of produce donated to the community kitchen</li><li>Zero mains water used for irrigation since April</li></ul><p>The award comes with a grant that will fund a second growing terrace.</p>','https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=1600&q=80',(SELECT id FROM public.categories WHERE slug='community-projects'),'Grace Adeyemi','published',false,5,'The youth club rooftop garden and rainwater harvesting project wins a regional green innovation award.',1120,205,now() - interval '25 days'),
('Scholarship Opportunities Now Open for 2026','Six funded places covering tuition, materials and transport for club members.','scholarship-opportunities-2026','Six fully funded scholarships are open to members continuing into further or higher education this year.','<p>Six fully funded scholarships are open to members continuing into further or higher education. Each award covers tuition support, learning materials and a monthly transport stipend.</p><h2>Who can apply</h2><ul><li>Active members with at least twelve months in the club</li><li>Confirmed or pending place at an accredited institution</li><li>Demonstrated community contribution</li></ul><h2>How to apply</h2><p>Submit a completed form, one academic reference and a 500-word statement describing how you intend to give back to the community. The panel interviews shortlisted candidates in the final week of the month.</p><p>Applications close on the last Friday of the term. Late submissions cannot be considered.</p>','https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1600&q=80',(SELECT id FROM public.categories WHERE slug='education'),'Chidinma Eze','published',false,3,'Six funded youth club scholarships covering tuition, materials and transport are now open for applications.',1330,176,now() - interval '4 days'),
('Annual Sports Festival: Twelve Clubs, One Weekend','Athletics, football, basketball and the return of the inter-club relay.','annual-sports-festival','Twelve partner clubs and more than 600 athletes are expected at this year''s sports festival, headlined by the inter-club relay.','<p>Twelve partner clubs and more than <strong>600 athletes</strong> will gather for this year''s Annual Sports Festival.</p><h2>Events</h2><ul><li>Track and field across four age brackets</li><li>Five-a-side football, men''s and women''s</li><li>Basketball three-on-three</li><li>The inter-club relay, returning after two years</li></ul><h2>Volunteers needed</h2><p>We need 45 marshals, first-aid assistants and scorekeepers across the weekend. Volunteering counts toward your service hours.</p><p>Spectator entry is free for members and their families.</p>','https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1600&q=80',(SELECT id FROM public.categories WHERE slug='sports'),'Tobi Adeleke','published',false,3,'The annual youth club sports festival brings twelve clubs and 600 athletes together for one weekend.',889,143,now() - interval '8 days'),
('Community Outreach Programme Reaches 40 Households','Food parcels, home repairs and digital help delivered by member volunteers.','community-outreach-programme','Our winter outreach reached 40 households with food support, minor home repairs and one-to-one digital assistance for older residents.','<p>This winter''s outreach programme reached <strong>40 households</strong> across three neighbourhoods.</p><h2>What we delivered</h2><ul><li>40 food parcels assembled by the Wednesday volunteer team</li><li>17 minor home repairs, including draught-proofing and lighting</li><li>23 one-to-one digital help sessions for older residents</li></ul><h2>Partnerships</h2><p>The programme ran with two local grocers, a hardware supplier and the district social care team, who identified households most in need.</p><p>Outreach resumes in the spring with a focus on garden and mobility support.</p>','https://images.unsplash.com/photo-1593113630400-ea4288922497?auto=format&fit=crop&w=1600&q=80',(SELECT id FROM public.categories WHERE slug='volunteer-activities'),'Amara Okonkwo','published',false,4,'Youth club winter outreach delivers food parcels, home repairs and digital help to 40 households.',651,112,now() - interval '17 days'),
('New Members Induction: What to Expect in Your First Month','A practical guide for everyone joining the club this term.','new-members-induction','From your first tour to choosing a programme, here is exactly what your first month at the youth club looks like.','<p>Joining a club with 900 members can feel overwhelming. Here is exactly what your first month looks like.</p><h2>Week one</h2><p>A guided tour, a membership card and a short conversation with a member of the welcome team about what you want out of the club.</p><h2>Week two and three</h2><p>Try any three programmes free of commitment. Most new members sample sport, a workshop and a volunteering session before choosing.</p><h2>Week four</h2><p>Pick your core programme and meet your assigned mentor. Mentors are experienced members, not staff, and are matched by interest.</p><p>Questions? The welcome desk is staffed every weekday from 4pm.</p>','https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1600&q=80',(SELECT id FROM public.categories WHERE slug='announcements'),'Daniel Mensah','published',false,3,'A practical guide to your first month as a new youth club member.',502,71,now() - interval '2 days'),
('Draft: Spring Newsletter Editorial Plan','Planning notes for the upcoming spring edition.','spring-newsletter-editorial-plan','Working outline of themes, contributors and deadlines for the spring edition of the club newsletter.','<p>Working outline for the spring edition.</p><h2>Proposed themes</h2><ul><li>Alumni careers retrospective</li><li>Green campus phase two</li><li>Member photography showcase</li></ul><p>Contributor deadlines to be confirmed at the next editorial meeting.</p>','https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1600&q=80',(SELECT id FROM public.categories WHERE slug='announcements'),'Grace Adeyemi','draft',false,2,'Internal planning notes for the spring newsletter edition.',0,0,NULL);

-- link tags
INSERT INTO public.post_tags (post_id, tag_id)
SELECT p.id, t.id FROM (VALUES
 ('community-clean-up-campaign','community'),('community-clean-up-campaign','environment'),('community-clean-up-campaign','volunteering'),
 ('youth-leadership-conference','leadership'),('youth-leadership-conference','training'),('youth-leadership-conference','events'),
 ('digital-skills-bootcamp','technology'),('digital-skills-bootcamp','training'),('digital-skills-bootcamp','education'),
 ('mental-health-awareness-week','mental-health'),('mental-health-awareness-week','wellbeing'),
 ('volunteer-spotlight-tobi','volunteering'),('volunteer-spotlight-tobi','mentorship'),
 ('career-development-workshop-series','careers'),('career-development-workshop-series','training'),
 ('environmental-sustainability-project','environment'),('environmental-sustainability-project','innovation'),
 ('scholarship-opportunities-2026','scholarships'),('scholarship-opportunities-2026','education'),
 ('annual-sports-festival','sports'),('annual-sports-festival','teamwork'),('annual-sports-festival','events'),
 ('community-outreach-programme','outreach'),('community-outreach-programme','volunteering'),
 ('new-members-induction','community'),('new-members-induction','youth-voice')
) AS x(slug, tag)
JOIN public.posts p ON p.slug = x.slug
JOIN public.tags t ON t.slug = x.tag;

-- EVENTS
INSERT INTO public.events (title, description, event_date, venue, image_url, registration_url) VALUES
('Saturday Community Tutoring','Free maths and literacy tutoring for primary pupils, run by member volunteers.', now() + interval '5 days','Youth Club Learning Wing','https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80','#'),
('Digital Skills Bootcamp — Cohort 7 Orientation','Meet the instructors and collect your course materials.', now() + interval '12 days','Innovation Lab','https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80','#'),
('Annual Sports Festival','Two days of athletics, football and the inter-club relay.', now() + interval '21 days','Municipal Sports Ground','https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1200&q=80','#'),
('Employer Showcase Evening','Meet eight employers offering internships and entry-level roles.', now() + interval '30 days','Main Hall','https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80','#'),
('Wellbeing Walk and Talk','A relaxed guided walk with peer support listeners on hand.', now() + interval '38 days','Riverside Park Entrance','https://images.unsplash.com/photo-1476611317561-60117649dd94?auto=format&fit=crop&w=1200&q=80','#');
