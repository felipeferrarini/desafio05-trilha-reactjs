import { GetStaticPaths, GetStaticProps } from 'next';

import Prismic from '@prismicio/client';
import Head from 'next/head';
import { FaRegCalendar, FaRegClock, FaRegUser } from 'react-icons/fa';
import { useRouter } from 'next/router';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Header from '../../components/Header';
import { formatDate } from '../../utils/format';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();

  if (router.isFallback) {
    return (
      <>
        <Head>
          <title>carregando post... | spacetravelling.</title>
        </Head>

        <Header />

        <div className={styles.postLoading}>
          <h5>Carregando...</h5>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{post.data.title} | spacetravelling.</title>
      </Head>

      <Header />

      <div
        className={styles.bannerContainer}
        style={{ backgroundImage: `url(${post.data.banner.url})` }}
      />

      <main
        className={`${commonStyles.wrapperContainer} ${styles.postContainer}`}
      >
        <h1>{post.data.title}</h1>
        <div>
          <time>
            <FaRegCalendar />
            {formatDate(new Date(post.first_publication_date))}
          </time>
          <span>
            <FaRegUser />
            {post.data.author}
          </span>
          <span>
            <FaRegClock />4 min
          </span>
        </div>

        <section className={styles.postContent}>
          {post.data.content.map(content => (
            <article key={content.heading}>
              <h2>{content.heading}</h2>
              {content.body.map(body => (
                <p key={body.text}>{body.text}</p>
              ))}
            </article>
          ))}
        </section>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: [
        'publication.title',
        'publication.subtitle',
        'publication.author',
        'publication.banner',
        'publication.content',
      ],
      pageSize: 1,
    }
  );

  const params = posts.results.map(post => ({
    params: {
      slug: post.uid,
    },
  }));

  return {
    paths: params,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    first_publication_date: response.first_publication_date || null,
    uid: response.uid,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content.map(content => ({
        heading: content.heading,
        body: content.body.map(body => ({
          spans: body.spans,
          text: body.text,
          type: body.type,
        })),
      })),
    },
  };

  return {
    props: { post },
  };
};
