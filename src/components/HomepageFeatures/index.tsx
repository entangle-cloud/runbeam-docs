import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: ReactNode;
  link: string;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Runbeam Cloud',
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        Centralized management platform for your data integration infrastructure.
        Manage gateways, configure services, and collaborate with your team.
      </>
    ),
    link: '/runbeam/overview',
  },
  {
    title: 'Harmony Proxy',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        Production-ready data mesh proxy with multi-protocol support (HTTP/JSON, FHIR, DICOM/DICOMweb, JMIX).
        Configurable pipelines with hot configuration reload.
      </>
    ),
    link: '/harmony/overview',
  },
  {
    title: 'CLI & SDK',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        Command-line tools and Rust SDK for managing Harmony instances and integrating with Runbeam Cloud.
        Secure authentication with OS keychain integration.
      </>
    ),
    link: '/cli/overview',
  },
];

function Feature({title, Svg, description, link}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
        <div className="margin-top--md">
          <Link
            className="button button--outline button--md"
            to={link}>
            Learn More →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
