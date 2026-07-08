/**
 * Mock persistence. Jobs include screeningQuestions; applications carry pipeline status + answers.
 */
(function () {
  var JOBS_KEY = 'portal_jobs_v1';
  var APPS_KEY = 'portal_applications_v2';
  var APPS_KEY_LEGACY = 'portal_applications_v1';

  var PIPELINE_STATUSES = ['new', 'screening', 'interview', 'offer', 'hired', 'declined'];

  var seedJobs = [
    {
      id: 'job_vp_eng',
      title: 'VP of Software Engineering',
      department: 'Development',
      location: 'Remote, Ghana',
      status: 'published',
      publishedAt: '2026-05-01',
      description:
        'Lead platform engineering across product, security, and architecture. Published role with structured screening.',
      screeningQuestions: [
        {
          id: 'sq_years',
          label: 'Years leading engineering teams',
          type: 'single',
          filterable: true,
          options: ['0–2', '3–5', '6–10', '10+']
        },
        {
          id: 'sq_tz',
          label: 'Overlapping timezone (UTC)',
          type: 'single',
          filterable: true,
          options: ['UTC±0–2', 'UTC±3–5', 'Americas-friendly', 'APAC-friendly']
        },
        {
          id: 'sq_stack',
          label: 'Strongest backend environment',
          type: 'multi',
          filterable: true,
          options: ['Kubernetes', 'Serverless', 'Bare-metal / VM', 'Hybrid']
        }
      ]
    },
    {
      id: 'job_ai_eng',
      title: 'AI Engineer',
      department: 'AI & Data',
      location: 'Remote, SA / Europe',
      status: 'published',
      publishedAt: '2026-04-18',
      description: 'Ship production ML features with clear evaluation and monitoring.',
      screeningQuestions: [
        {
          id: 'sq_ml',
          label: 'Primary ML focus',
          type: 'single',
          filterable: true,
          options: ['NLP', 'Vision', 'Tabular', 'RL / agents']
        },
        {
          id: 'sq_prod',
          label: 'Production ML experience',
          type: 'single',
          filterable: true,
          options: ['0–1 years', '1–3 years', '3+ years']
        }
      ]
    },
    {
      id: 'job_draft',
      title: 'Product Marketing Manager (draft)',
      department: 'Marketing',
      location: 'Remote',
      status: 'draft',
      publishedAt: null,
      description: 'Draft posting — not visible on public careers until published.',
      screeningQuestions: []
    }
  ];

  var seedApplications = [
    {
      id: 'app_1',
      jobId: 'job_vp_eng',
      submittedAt: '2026-05-14T09:22:00',
      candidateName: 'Ama Osei',
      email: 'ama@example.com',
      phone: '+233 54 357 9090',
      source: 'Careers website',
      status: 'interview',
      notes: 'Strong infra background; scheduled panel for next week.',
      answers: {
        sq_years: '6–10',
        sq_tz: 'UTC±3–5',
        sq_stack: ['Kubernetes', 'Hybrid']
      }
    },
    {
      id: 'app_2',
      jobId: 'job_vp_eng',
      submittedAt: '2026-05-15T11:05:00',
      candidateName: 'Kwesi Mensah',
      email: 'kwesi@example.com',
      phone: '+233 20 551 4821',
      source: 'Careers website',
      status: 'screening',
      notes: '',
      answers: {
        sq_years: '3–5',
        sq_tz: 'Americas-friendly',
        sq_stack: ['Serverless']
      }
    },
    {
      id: 'app_3',
      jobId: 'job_ai_eng',
      submittedAt: '2026-05-12T14:40:00',
      candidateName: 'Rosa Kim',
      email: 'rosa@example.com',
      phone: '+44 7911 558822',
      source: 'LinkedIn',
      status: 'offer',
      notes: '',
      answers: {
        sq_ml: 'NLP',
        sq_prod: '3+ years'
      }
    },
    {
      id: 'app_4',
      jobId: 'job_ai_eng',
      submittedAt: '2026-05-13T09:15:00',
      candidateName: 'James Ndlovu',
      email: 'james@example.com',
      phone: '+27 82 774 9910',
      source: 'Referral',
      status: 'new',
      notes: '',
      answers: {
        sq_ml: 'Vision',
        sq_prod: '1–3 years'
      }
    }
  ];

  function normalizeApplication(a) {
    var st =
      PIPELINE_STATUSES.indexOf(String(a.status || '').toLowerCase()) >= 0
        ? String(a.status).toLowerCase()
        : 'new';
    return {
      id: a.id,
      jobId: a.jobId,
      submittedAt: a.submittedAt || new Date().toISOString(),
      candidateName: a.candidateName || 'Unknown',
      email: a.email || '',
      phone: typeof a.phone === 'string' ? a.phone : '',
      source: typeof a.source === 'string' ? a.source : 'Website',
      status: st,
      notes: typeof a.notes === 'string' ? a.notes : '',
      answers: typeof a.answers === 'object' && a.answers !== null ? a.answers : {}
    };
  }

  function read(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }

  function write(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  function loadApplicationsNormalized() {
    var raw =
      localStorage.getItem(APPS_KEY) !== null ? read(APPS_KEY, []) : read(APPS_KEY_LEGACY, []);
    if (
      raw.length === 0 &&
      !localStorage.getItem(APPS_KEY) &&
      !localStorage.getItem(APPS_KEY_LEGACY)
    )
      raw = seedApplications.slice();
    var out = raw.map(normalizeApplication);
    write(APPS_KEY, out);
    return out;
  }

  function seed() {
    try {
      if (!localStorage.getItem(JOBS_KEY))
        localStorage.setItem(JOBS_KEY, JSON.stringify(seedJobs));

      loadApplicationsNormalized();
    } catch (e) {
      console.warn('PortalStore: localStorage unavailable', e);
    }
  }

  seed();

  window.PortalStore = {
    PIPELINE_STATUSES: PIPELINE_STATUSES,

    getJobs: function () {
      return read(JOBS_KEY, seedJobs);
    },
    saveJobs: function (jobs) {
      write(JOBS_KEY, jobs);
    },
    getJob: function (id) {
      return this.getJobs().find(function (j) {
        return j.id === id;
      });
    },
    upsertJob: function (job) {
      var jobs = this.getJobs();
      var i = jobs.findIndex(function (j) {
        return j.id === job.id;
      });
      if (i >= 0) jobs[i] = job;
      else jobs.push(job);
      this.saveJobs(jobs);
      return job;
    },
    deleteJob: function (id) {
      this.saveJobs(
        this.getJobs().filter(function (j) {
          return j.id !== id;
        })
      );
    },

    getApplications: function () {
      return loadApplicationsNormalized();
    },
    saveApplications: function (apps) {
      write(
        APPS_KEY,
        apps.map(normalizeApplication)
      );
    },
    getApplication: function (id) {
      return this.getApplications().find(function (a) {
        return a.id === id;
      });
    },
    upsertApplication: function (app) {
      var apps = this.getApplications();
      var n = normalizeApplication(app);
      var i = apps.findIndex(function (a) {
        return a.id === n.id;
      });
      if (i >= 0) apps[i] = n;
      else apps.push(n);
      this.saveApplications(apps);
      return n;
    },

    resetSeed: function () {
      write(JOBS_KEY, seedJobs);
      localStorage.removeItem(APPS_KEY);
      localStorage.removeItem(APPS_KEY_LEGACY);
      write(APPS_KEY, seedApplications.map(normalizeApplication));
    },

    slugifyId: function (title) {
      var base =
        'job_' +
        String(title || 'posting')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '_')
          .replace(/^_|_$/g, '')
          .slice(0, 40);
      var jobs = this.getJobs();
      var id = base;
      var n = 0;
      while (jobs.some(function (j) {
        return j.id === id;
      })) {
        n += 1;
        id = base + '_' + n;
      }
      return id;
    }
  };
})();
