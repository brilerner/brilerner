export const site = {
  name: "Brian Lerner",
  title: "Brian Lerner",
  identity: "PhD candidate, machine learning for healthcare · Duke University",
  description:
    "Brian Lerner is a Duke ECE PhD candidate building multimodal machine learning systems for healthcare.",
  email: "brianelerner@gmail.com",
  scholar: "https://scholar.google.com/citations?user=BhmbGCQAAAAJ&hl=en",
  github: "https://github.com/brilerner",
  linkedin: "https://www.linkedin.com/in/brian-lerner/",
  orcid: "https://orcid.org/0000-0002-6406-9790",
  repository: "https://github.com/brilerner/brilerner.github.io",
  url: "https://brilerner.github.io",
} as const;

export const navigation = [
  { href: "/", label: "home" },
  { href: "/publications/", label: "publications" },
  { href: "/writing/", label: "writing" },
  { href: "/cv/", label: "cv" },
] as const;
