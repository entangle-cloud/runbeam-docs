import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";
import "./src/theme/toml-highlight";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: "Runbeam",
  tagline: "Runbeam + Harmony",
  favicon: "img/favicon.ico",

  clientModules: ["./src/client-modules/entangle.js"],
  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: "https://docs.runbeam.io",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "aurabx", // Usually your GitHub org/user name.
  projectName: "docs", // Usually your repo name.

  onBrokenLinks: "throw",

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          path: "docs",
          routeBasePath: "docs",
          sidebarPath: "./sidebars.ts",
        },
        blog: false,
        theme: {
          customCss: ["./src/css/custom.css", "./static/fonts.css"],
        },
      } satisfies Preset.Options,
    ],
  ],

  themes: ["@docusaurus/theme-mermaid"],

  markdown: {
    mermaid: true,
  },

  plugins: [
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "runbeam",
        path: "runbeam",
        routeBasePath: "runbeam",
        sidebarPath: "./sidebars-runbeam.ts",
      },
    ],
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "harmony",
        path: "harmony",
        routeBasePath: "harmony",
        sidebarPath: "./sidebars-harmony.ts",
      },
    ],
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "cli",
        path: "cli",
        routeBasePath: "cli",
        sidebarPath: "./sidebars-cli.ts",
      },
    ],
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "sdk",
        path: "sdk",
        routeBasePath: "sdk",
        sidebarPath: "./sidebars-sdk.ts",
      },
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: "img/docusaurus-social-card.jpg",
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: "Runbeam",
      logo: {
        alt: "Runbeam Logo",
        src: "img/logo.svg",
      },
      items: [
        {
          type: "docSidebar",
          sidebarId: "docsSidebar",
          position: "left",
          label: "Overview",
        },
        {
          type: "docSidebar",
          sidebarId: "runbeamSidebar",
          docsPluginId: "runbeam",
          position: "left",
          label: "Runbeam",
        },
        {
          type: "docSidebar",
          sidebarId: "harmonySidebar",
          docsPluginId: "harmony",
          position: "left",
          label: "Harmony",
        },
        {
          type: "docSidebar",
          sidebarId: "cliSidebar",
          docsPluginId: "cli",
          position: "left",
          label: "CLI",
        },
        {
          type: "docSidebar",
          sidebarId: "sdkSidebar",
          docsPluginId: "sdk",
          position: "left",
          label: "SDK",
        },
        {
          href: "https://runbeam.io",
          label: "Runbeam Cloud",
          position: "right",
        },
        {
          href: "https://github.com/aurabx/harmony",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Docs",
          items: [
            {
              label: "Getting Started",
              to: "/docs/intro",
            },
            {
              label: "Runbeam Cloud",
              to: "/runbeam",
            },
            {
              label: "Harmony Proxy",
              to: "/harmony",
            },
            {
              label: "CLI",
              to: "/cli",
            },
            {
              label: "SDK",
              to: "/sdk",
            },
          ],
        },
        {
          title: "Products",
          items: [
            {
              label: "Runbeam Cloud",
              href: "https://runbeam.io",
            },
            {
              label: "Harmony Proxy",
              href: "https://runbeam.io/product/harmony-proxy",
            },
          ],
        },
        {
          title: "More",
          items: [
            {
              label: "GitHub",
              href: "https://github.com/aurabx/harmony",
            },
            {
              label: "Support",
              href: "mailto:hello@aurabox.cloud",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} <a href="https://aurabox.cloud" target="_blank" rel="noopener noreferrer">Aurabox Pty Ltd</a>.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ["toml"],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
