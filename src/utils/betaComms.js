/**
 * @fileoverview Beta Tester Communication System
 * @module utils/betaComms
 *
 * Generates professional, warm notifications for beta testers when:
 * - Bugs they reported are fixed
 * - New features are deployed they should test
 * - Their feedback led to a change
 * - Weekly beta digest summaries
 *
 * Integrates with Supabase for tracking and admin dashboard for triggering.
 *
 * Flow: Beta tester reports bug → Admin logs it → Dev fixes it →
 *       System generates personalized notification → Admin sends via SMS/email
 */

/**
 * Bug fix notification template
 * @param {Object} opts
 * @param {string} opts.testerName - Beta tester's first name
 * @param {number} opts.testerNumber - Beta tester number (e.g. 1 for first)
 * @param {string} opts.bugTitle - Short bug description
 * @param {string} opts.bugDescription - What the tester experienced
 * @param {string[]} opts.rootCauses - Technical causes (simplified for non-dev)
 * @param {string[]} opts.fixes - What was fixed (user-friendly language)
 * @param {Object[]} opts.testSteps - Steps to verify the fix
 * @param {string} opts.testSteps[].step - Step description
 * @param {string} [opts.testSteps[].expected] - Expected result
 * @param {string} [opts.platform] - "mobile" | "desktop" | "both"
 * @param {string} [opts.appUrl] - App URL for testing
 * @returns {Object} { sms: string, email: { subject, body } }
 */
export function generateBugFixNotification(opts) {
  const {
    testerName,
    testerNumber = 0,
    bugTitle,
    bugDescription,
    rootCauses = [],
    fixes = [],
    testSteps = [],
    platform = "both",
    appUrl = "",
  } = opts;

  const testerBadge = testerNumber > 0
    ? `You're officially Beta Tester #${testerNumber} 🏆`
    : "Your beta feedback is making a real difference";

  // ═══ SMS VERSION (concise) ═══
  const sms = [
    `Hey ${testerName}! 🎉`,
    ``,
    `THANK YOU for being ${testerNumber > 0 ? `our #${testerNumber}` : "a"} beta tester` +
    ` on ZoneWise Lending. Your feedback caught a real bug that would have` +
    ` frustrated every future user — incredibly valuable.`,
    ``,
    `🐛 THE BUG YOU FOUND`,
    bugDescription,
    ``,
    `🔧 WHAT CAUSED IT`,
    ...rootCauses.map((c, i) => `${i + 1}. ${c}`),
    ``,
    `✅ WHAT WE FIXED`,
    ...fixes.map((f, i) => `${i + 1}. ${f}`),
    ``,
    `📋 TO TEST THE FIX — Step by Step:`,
    ``,
    ...(platform !== "mobile" ? [
      `1. Open the app in your browser${appUrl ? ` (${appUrl})` : ""}`,
      `2. Do a HARD REFRESH:`,
      `   • On laptop: Ctrl + Shift + R (Windows) or Cmd + Shift + R (Mac)`,
      `   • On phone: Pull down to refresh, or close the tab and reopen`,
      `3. Log in with your account`,
    ] : [
      `1. Close the app completely`,
      `2. Reopen${appUrl ? ` ${appUrl}` : ""}`,
      `3. Log in with your account`,
    ]),
    ...testSteps.map((s, i) => {
      const num = (platform !== "mobile" ? 4 : 4) + i;
      return s.expected
        ? `${num}. ${s.step}\n   → ${s.expected} ✅`
        : `${num}. ${s.step}`;
    }),
    ``,
    `If anything still feels off, send me exactly which field and which step — screenshots help a lot.`,
    ``,
    testerBadge,
    `Keep the feedback coming — every comment makes the product better.`,
    ``,
    `— Ariel & the ZoneWise team`,
  ].join("\n");

  // ═══ EMAIL VERSION (richer) ═══
  const emailSubject = `✅ Fixed: "${bugTitle}" — Thanks for catching this!`;
  const emailBody = [
    `Hi ${testerName},`,
    ``,
    `Thank you for your feedback on ZoneWise Lending! You caught a bug that would have frustrated every user who came after you. That's exactly why beta testing matters.`,
    ``,
    `Here's a quick summary of what happened and what we did about it:`,
    ``,
    `THE BUG`,
    `${bugDescription}`,
    ``,
    `ROOT CAUSE`,
    ...rootCauses.map((c, i) => `${i + 1}. ${c}`),
    ``,
    `THE FIX`,
    ...fixes.map((f, i) => `${i + 1}. ${f}`),
    ``,
    `HOW TO VERIFY`,
    `Please hard-refresh your browser (Ctrl+Shift+R or Cmd+Shift+R) and test the following:`,
    ...testSteps.map((s, i) => s.expected
      ? `${i + 1}. ${s.step} → Expected: ${s.expected}`
      : `${i + 1}. ${s.step}`
    ),
    ``,
    `If you notice anything else, just reply to this email with the details and a screenshot if possible.`,
    ``,
    testerBadge,
    ``,
    `Best,`,
    `Ariel Shapira`,
    `ZoneWise.AI`,
  ].join("\n");

  return {
    sms,
    email: { subject: emailSubject, body: emailBody },
    metadata: {
      type: "bug_fix",
      testerName,
      testerNumber,
      bugTitle,
      generatedAt: new Date().toISOString(),
    },
  };
}

/**
 * New feature notification template
 * @param {Object} opts
 * @param {string} opts.testerName
 * @param {string} opts.featureTitle
 * @param {string} opts.featureDescription
 * @param {string[]} opts.whatToTest
 * @param {string} [opts.appUrl]
 * @returns {Object} { sms, email }
 */
export function generateFeatureNotification(opts) {
  const { testerName, featureTitle, featureDescription, whatToTest = [], appUrl = "" } = opts;

  const sms = [
    `Hey ${testerName}! 🚀`,
    ``,
    `New feature just dropped on ZoneWise Lending and we'd love your feedback:`,
    ``,
    `✨ ${featureTitle.toUpperCase()}`,
    featureDescription,
    ``,
    `📋 WHAT TO TEST:`,
    ...whatToTest.map((t, i) => `${i + 1}. ${t}`),
    ``,
    `${appUrl ? `🔗 ${appUrl}` : "Open the app and hard-refresh to see it."}`,
    ``,
    `Any thoughts — good or bad — just reply here. Raw honest feedback > polite silence.`,
    ``,
    `— Ariel & the ZoneWise team`,
  ].join("\n");

  const email = {
    subject: `🚀 New: "${featureTitle}" — Ready for your feedback`,
    body: sms,
  };

  return {
    sms,
    email,
    metadata: {
      type: "new_feature",
      testerName,
      featureTitle,
      generatedAt: new Date().toISOString(),
    },
  };
}

/**
 * Weekly beta digest
 * @param {Object} opts
 * @param {string} opts.testerName
 * @param {number} opts.bugsFixed - Total bugs fixed this week
 * @param {number} opts.featuresShipped - Features shipped
 * @param {string[]} opts.highlights - Key changes (3-5 items)
 * @param {string[]} opts.upNext - Coming next week
 * @param {number} opts.totalBetaTesters - Current beta tester count
 * @returns {Object} { sms, email }
 */
export function generateWeeklyDigest(opts) {
  const {
    testerName, bugsFixed = 0, featuresShipped = 0,
    highlights = [], upNext = [], totalBetaTesters = 1,
  } = opts;

  const sms = [
    `Hey ${testerName}! 📊`,
    ``,
    `Your weekly ZoneWise beta update:`,
    ``,
    `THIS WEEK:`,
    `🐛 ${bugsFixed} bugs fixed`,
    `🚀 ${featuresShipped} features shipped`,
    `👥 ${totalBetaTesters} beta testers active`,
    ``,
    `KEY CHANGES:`,
    ...highlights.map(h => `✅ ${h}`),
    ``,
    ...(upNext.length > 0 ? [
      `COMING NEXT WEEK:`,
      ...upNext.map(u => `🔜 ${u}`),
      ``,
    ] : []),
    `Questions? Just reply. Your feedback drives what we build.`,
    ``,
    `— Ariel & the ZoneWise team`,
  ].join("\n");

  return {
    sms,
    email: {
      subject: `📊 ZoneWise Beta Weekly: ${bugsFixed} fixes, ${featuresShipped} features`,
      body: sms,
    },
    metadata: {
      type: "weekly_digest",
      testerName,
      bugsFixed,
      featuresShipped,
      generatedAt: new Date().toISOString(),
    },
  };
}

/**
 * Supabase table schema for beta tester tracking
 * Run this migration to set up the beta_testers and beta_comms tables.
 *
 * Tables:
 *   beta_testers: id, name, email, phone, tester_number, joined_at, active
 *   beta_comms: id, tester_id, type, content, sent_via, sent_at, metadata
 */
export const BETA_TABLES_MIGRATION = `
-- Beta testers registry
CREATE TABLE IF NOT EXISTS beta_testers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  tester_number SERIAL,
  joined_at TIMESTAMPTZ DEFAULT now(),
  active BOOLEAN DEFAULT true,
  notes TEXT
);

-- Communication log
CREATE TABLE IF NOT EXISTS beta_comms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tester_id UUID REFERENCES beta_testers(id),
  type TEXT NOT NULL CHECK (type IN ('bug_fix', 'new_feature', 'weekly_digest', 'custom')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  sent_via TEXT CHECK (sent_via IN ('sms', 'email', 'both', 'pending')),
  sent_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Bug reports from beta testers
CREATE TABLE IF NOT EXISTS beta_bug_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tester_id UUID REFERENCES beta_testers(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'fixing', 'fixed', 'wont_fix')),
  fix_commit TEXT,
  fix_notification_id UUID REFERENCES beta_comms(id),
  reported_at TIMESTAMPTZ DEFAULT now(),
  fixed_at TIMESTAMPTZ
);

-- RLS
ALTER TABLE beta_testers ENABLE ROW LEVEL SECURITY;
ALTER TABLE beta_comms ENABLE ROW LEVEL SECURITY;
ALTER TABLE beta_bug_reports ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY "admin_beta_testers" ON beta_testers FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin'));
CREATE POLICY "admin_beta_comms" ON beta_comms FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin'));
CREATE POLICY "admin_beta_bugs" ON beta_bug_reports FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin'));
`;
