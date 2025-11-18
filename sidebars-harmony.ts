import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  harmonySidebar: [
    {
      type: 'doc',
      id: 'overview',
      label: 'Overview',
    },
    {
      type: 'doc',
      id: 'quickstart',
      label: 'Quick Start',
    },
    {
      type: 'doc',
      id: 'installation',
      label: 'Installation',
    },
    {
      type: 'category',
      label: 'Configuration',
      collapsed: false,
      items: [
        {
          type: 'doc',
          id: 'configuration/index',
          label: 'Overview',
        },
        {
          type: 'doc',
          id: 'configuration/services',
          label: 'Services',
        },
        {
          type: 'doc',
          id: 'configuration/middleware',
          label: 'Middleware',
        },
        {
          type: 'doc',
          id: 'configuration/authentication',
          label: 'Authentication',
        },
      ],
    },
    {
      type: 'doc',
      id: 'deployment',
      label: 'Deployment',
    },
  ],
};

export default sidebars;
