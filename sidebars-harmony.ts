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
          id: 'configuration/system',
          label: 'System',
        },
        {
          type: 'doc',
          id: 'configuration/pipelines',
          label: 'Pipelines',
        },
        {
          type: 'doc',
          id: 'configuration/mesh',
          label: 'Data Mesh',
        },
        {
          type: 'doc',
          id: 'configuration/providers',
          label: 'Providers',
        },
        {
          type: 'doc',
          id: 'configuration/references',
          label: 'References',
        },
      ],
    },
    {
      type: 'category',
      label: 'Components',
      collapsed: false,
      items: [
        {
          type: 'doc',
          id: 'components/authentication',
          label: 'Authentication',
        },
        {
          type: 'category',
          label: 'Middleware',
          collapsed: false,
          link: {
            type: 'doc',
            id: 'components/middleware',
          },
          items: [
            {
              type: 'doc',
              id: 'components/middleware/basic-auth',
              label: 'Basic Auth',
            },
            {
              type: 'doc',
              id: 'components/middleware/dicom-flatten',
              label: 'DICOM Flatten',
            },
            {
              type: 'doc',
              id: 'components/middleware/dicom-to-dicomweb',
              label: 'DICOM to DICOMweb',
            },
            {
              type: 'doc',
              id: 'components/middleware/dicomweb-bridge',
              label: 'DICOMweb to DICOM',
            },
            {
              type: 'doc',
              id: 'components/middleware/jmix-builder',
              label: 'JMIX Builder',
            },
            {
              type: 'doc',
              id: 'components/middleware/jwt-auth',
              label: 'JWT Auth',
            },
            {
              type: 'doc',
              id: 'components/middleware/log-dump',
              label: 'Log Dump',
            },
            {
              type: 'doc',
              id: 'components/middleware/metadata-transform',
              label: 'Metadata Transform',
            },
            {
              type: 'doc',
              id: 'components/middleware/path-filter',
              label: 'Path Filter',
            },
            {
              type: 'doc',
              id: 'components/middleware/transform-jolt',
              label: 'Transform (JOLT)',
            },
            {
              type: 'doc',
              id: 'components/middleware/webhook',
              label: 'Webhook',
            },
          ],
        },
        {
          type: 'doc',
          id: 'components/policies',
          label: 'Policies',
        },
        {
          type: 'doc',
          id: 'components/services',
          label: 'Services',
        },
        {
          type: 'doc',
          id: 'components/transforms',
          label: 'Transforms',
        },
      ],
    },
    {
      type: 'category',
      label: 'Deployment',
      collapsed: false,
      items: [
        {
          type: 'doc',
          id: 'deployment/deployment',
          label: 'Deployment',
        },
      ],
    },

    {
      type: 'category',
      label: 'Guides',
      collapsed: false,
      items: [
        {
          type: 'doc',
          id: 'guides/adding-pipelines',
          label: 'Adding Pipelines',
        },
      ],
    },
  ],
};

export default sidebars;
