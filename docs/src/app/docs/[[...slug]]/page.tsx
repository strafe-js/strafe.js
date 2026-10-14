import { source } from '@/lib/source';
import { DocsPage, DocsBody, DocsDescription, DocsTitle } from 'fumadocs-ui/page';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import { notFound } from 'next/navigation';
import { ApiPlayground } from '@/components/ApiPlayground';
import { Badge } from '@/components/Badge';
import { CommandBuilder } from '@/components/CommandBuilder';
import { MethodCard } from '@/components/MethodCard';
import { PermissionCalculator } from '@/components/PermissionCalculator';
import { PropertyTable } from '@/components/PropertyTable';

const mdxComponents = {
  ...defaultMdxComponents,
  ApiPlayground,
  Badge,
  CommandBuilder,
  MethodCard,
  PermissionCalculator,
  PropertyTable,
};

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const data = page.data as any;
  const MDX = data.body;

  return (
    <DocsPage toc={data.toc} full={data.full}>
      <DocsTitle>{data.title}</DocsTitle>
      <DocsDescription>{data.description}</DocsDescription>
      <DocsBody>
        <MDX components={mdxComponents} />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const title = page.data.title;
  const description =
    page.data.description ||
    'Complete TypeScript & JavaScript SDK suite for the Strafe Chat REST API and WebSocket Gateway.';
  const pageTitle = `${title} | Strafe.js`;
  const strafeIcon512 = 'https://app.strafe.chat/icons/icon-512.png';

  return {
    title,
    description,
    openGraph: {
      type: 'article',
      siteName: 'Strafe.js Documentation',
      title: pageTitle,
      description,
      url: page.url,
      images: [
        {
          url: strafeIcon512,
          width: 512,
          height: 512,
          alt: pageTitle,
          type: 'image/png',
        },
      ],
    },
    twitter: {
      card: 'summary',
      title: pageTitle,
      description,
      images: [strafeIcon512],
    },
  };
}
