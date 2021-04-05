import { Document } from '@prismicio/client/types/documents';
import Prismic from '@prismicio/client';
import { DefaultClient } from '@prismicio/client/types/client';
import { NextApiHandler } from 'next';
import { ApiOptions } from '@prismicio/client/types/Api';

function linkResolver(doc: Document): string {
  if (doc.type === 'posts') {
    return `/post/${doc.uid}`;
  }
  return '/';
}

const apiEndpoint = process.env.PRISMIC_API_ENDPOINT;
const accessToken = process.env.PRISMIC_ACCESS_TOKEN;

const createClientOptions = (
  req = null,
  prismicAccessToken = null
): ApiOptions => {
  const reqOption = req ? { req } : {};
  const accessTokenOption = prismicAccessToken
    ? { accessToken: prismicAccessToken }
    : {};
  return {
    ...reqOption,
    ...accessTokenOption,
  };
};

// Client method to query from the Prismic repo
const Client = (req = null): DefaultClient =>
  Prismic.client(apiEndpoint, createClientOptions(req, accessToken));

// eslint-disable-next-line consistent-return
const Preview: NextApiHandler = async (req, res) => {
  const { token: ref, documentId } = req.query;
  const redirectUrl = await Client(req)
    .getPreviewResolver(ref as string, documentId as string)
    .resolve(linkResolver, '/');

  if (!redirectUrl) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  res.setPreviewData({ ref });
  res.writeHead(302, { Location: `${redirectUrl}` });
  res.end();
};

export default Preview;
