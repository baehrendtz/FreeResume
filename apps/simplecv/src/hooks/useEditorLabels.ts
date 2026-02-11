import { useTranslations } from "next-intl";

export function useEditorLabels() {
  const t = useTranslations();

  const editor = {
    tabs: {
      basics: t("editor.tabs.basics"),
      summary: t("editor.tabs.summary"),
      experience: t("editor.tabs.experience"),
      education: t("editor.tabs.education"),
      skills: t("editor.tabs.skills"),
      languages: t("editor.tabs.languages"),
      extras: t("editor.tabs.extras"),
      visibility: t("editor.tabs.visibility"),
    },
    basics: {
      name: t("editor.basics.name"),
      headline: t("editor.basics.headline"),
      email: t("editor.basics.email"),
      phone: t("editor.basics.phone"),
      location: t("editor.basics.location"),
      linkedIn: t("editor.basics.linkedIn"),
      website: t("editor.basics.website"),
      photo: t("editor.basics.photo"),
      photoUpload: t("editor.basics.photoUpload"),
      photoRemove: t("editor.basics.photoRemove"),
    },
    summary: {
      label: t("editor.summary.label"),
      placeholder: t("editor.summary.placeholder"),
    },
    experience: {
      title: t("editor.experience.title"),
      company: t("editor.experience.company"),
      location: t("editor.experience.location"),
      startDate: t("editor.experience.startDate"),
      endDate: t("editor.experience.endDate"),
      description: t("editor.experience.description"),
      bullets: t("editor.experience.bullets"),
      add: t("editor.experience.add"),
      remove: t("editor.experience.remove"),
      hide: t("editor.experience.hide"),
      show: t("editor.experience.show"),
    },
    education: {
      institution: t("editor.education.institution"),
      degree: t("editor.education.degree"),
      field: t("editor.education.field"),
      startDate: t("editor.education.startDate"),
      endDate: t("editor.education.endDate"),
      description: t("editor.education.description"),
      add: t("editor.education.add"),
      remove: t("editor.education.remove"),
      hide: t("editor.education.hide"),
      show: t("editor.education.show"),
    },
    skills: {
      label: t("editor.skills.label"),
      placeholder: t("editor.skills.placeholder"),
      add: t("editor.skills.add"),
    },
    languages: {
      label: t("editor.languages.label"),
      placeholder: t("editor.languages.placeholder"),
      add: t("editor.languages.add"),
    },
    extras: {
      label: t("editor.extras.label"),
      placeholder: t("editor.extras.placeholder"),
      add: t("editor.extras.add"),
      addCategory: t("editor.extras.addCategory"),
      removeCategory: t("editor.extras.removeCategory"),
    },
    extrasCategories: {
      certifications: t("editor.extrasCategories.certifications"),
      honors: t("editor.extrasCategories.honors"),
      publications: t("editor.extrasCategories.publications"),
      volunteering: t("editor.extrasCategories.volunteering"),
      organizations: t("editor.extrasCategories.organizations"),
      courses: t("editor.extrasCategories.courses"),
      projects: t("editor.extrasCategories.projects"),
      patents: t("editor.extrasCategories.patents"),
      other: t("editor.extrasCategories.other"),
    },
    visibility: {
      title: t("editor.visibility.title"),
      description: t("editor.visibility.description"),
      summary: t("editor.visibility.summary"),
      experience: t("editor.visibility.experience"),
      education: t("editor.visibility.education"),
      skills: t("editor.visibility.skills"),
      languages: t("editor.visibility.languages"),
      extras: t("editor.visibility.extras"),
      contentLimitsTitle: t("editor.visibility.contentLimitsTitle"),
      contentLimitsDescription: t("editor.visibility.contentLimitsDescription"),
      maxExperience: t("editor.visibility.maxExperience"),
      maxEducation: t("editor.visibility.maxEducation"),
      maxSkills: t("editor.visibility.maxSkills"),
      maxBulletsPerJob: t("editor.visibility.maxBulletsPerJob"),
      summaryMaxChars: t("editor.visibility.summaryMaxChars"),
      maxExtras: t("editor.visibility.maxExtras"),
      simplifyLocationsTitle: t("editor.visibility.simplifyLocationsTitle"),
      simplifyLocationsDescription: t("editor.visibility.simplifyLocationsDescription"),
      simplifyLocations: t("editor.visibility.simplifyLocations"),
      template: t("editor.visibility.template"),
    },
  };

  const header = {
    importPdf: t("actions.importPdf"),
    downloadPdf: t("actions.downloadPdf"),
    generating: t("actions.generating"),
    moreActions: t("actions.moreActions"),
    themeToggle: t("theme.toggle"),
    help: t("help.trigger"),
  };

  const helpLabels = {
    title: t("help.title"),
    intro: t("help.intro"),
    howItWorksTitle: t("help.howItWorksTitle"),
    step1: t("help.step1"),
    step2: t("help.step2"),
    step3: t("help.step3"),
    downloadTitle: t("help.downloadTitle"),
    downloadText: t("help.downloadText"),
    dataTitle: t("help.dataTitle"),
    dataText: t("help.dataText"),
    footer: t("help.footer"),
  };

  const onboarding = {
    chooseTitle: t("onboarding.choose.title"),
    chooseSubtitle: t("onboarding.choose.subtitle"),
    importTitle: t("onboarding.choose.importTitle"),
    importDescription: t("onboarding.choose.importDescription"),
    scratchTitle: t("onboarding.choose.scratchTitle"),
    scratchDescription: t("onboarding.choose.scratchDescription"),
    howToGetPdf: t("onboarding.choose.howToGetPdf"),
    guideTitle: t("onboarding.guide.title"),
    guideStep1: t("onboarding.guide.step1"),
    guideStep2: t("onboarding.guide.step2"),
    guideStep3: t("onboarding.guide.step3"),
    uploadDropzone: t("upload.dropzone"),
    uploadProcessing: t("upload.processing"),
    uploadTitle: t("upload.title"),
    successTitle: t("onboarding.success.title"),
    successScratchTitle: t("onboarding.success.scratchTitle"),
    successScratchDescription: t("onboarding.success.scratchDescription"),
    successCta: t("onboarding.success.cta"),
    successExperience: t("onboarding.success.experience"),
    successEducation: t("onboarding.success.education"),
    successSkills: t("onboarding.success.skills"),
  };

  const importDialog = {
    title: t("actions.importPdf"),
    warning: t("actions.importWarning"),
    dropzone: t("upload.dropzone"),
    processing: t("upload.processing"),
    cancel: t("actions.cancel"),
  };

  const footer = {
    copyright: t("footer.copyright", { year: new Date().getFullYear() }),
    openSource: t("footer.openSource"),
    cookieSettings: t("consent.settings"),
  };

  return { editor, header, helpLabels, onboarding, importDialog, footer };
}
