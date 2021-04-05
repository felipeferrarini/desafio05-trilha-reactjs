import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';

import Prismic from '@prismicio/client';
import Head from 'next/head';
import { FaRegCalendar, FaRegClock, FaRegUser } from 'react-icons/fa';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Header from '../../components/Header';
import { formatDate, formatLongDate } from '../../utils/format';
import { UtterancesComments } from '../../components/UtterancesComents';

interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
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

interface postHood {
  uid: string;
  title: string;
}

interface PostProps {
  post: Post;
  readingTime?: number;
  preview?: boolean;
  nextPost?: postHood | null;
  previousPost?: postHood | null;
}

export default function Post({
  post,
  preview,
  readingTime,
  nextPost,
  previousPost,
}: PostProps): JSX.Element {
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
            <FaRegClock />
            {readingTime} min
          </span>
        </div>

        {post.last_publication_date && (
          <p>
            * editado em {formatLongDate(new Date(post.last_publication_date))}
          </p>
        )}

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

        <footer className={styles.postsNavigation}>
          {!!previousPost && (
            <Link href={`/post/${previousPost.uid}`}>
              <a>
                <p>{previousPost.title}</p>
                <span>Post anterior</span>
              </a>
            </Link>
          )}

          {!!nextPost && (
            <Link href={`/post/${nextPost.uid}`}>
              <a>
                <p>{nextPost.title}</p>
                <span>Próximo post</span>
              </a>
            </Link>
          )}
        </footer>

        <UtterancesComments />

        {!!preview && (
          <aside className={styles.exitPreview}>
            <Link href="/api/exit-preview">
              <a>Sair do modo Preview</a>
            </Link>
          </aside>
        )}
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

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false,
  previewData,
}) => {
  const { slug } = params;
  const prismic = getPrismicClient();
  const post: Post = await prismic.getByUID('posts', String(slug), {
    ref: previewData?.ref ?? null,
  });

  const readingTime = Math.floor(
    post.data.content.reduce((prev, acc) => {
      return prev.concat(RichText.asText(acc.body).split(' '));
    }, [] as string[]).length / 200
  );

  const nextPost = await prismic
    .query(
      [
        Prismic.predicates.at('document.type', 'posts'),
        Prismic.predicates.dateAfter(
          'document.first_publication_date',
          post.first_publication_date
        ),
      ],
      { orderings: '[document.first_publication_date]', pageSize: 1 }
    )
    .then(res =>
      res.results.length > 0
        ? {
            uid: res.results[0].uid,
            title: res.results[0].data ? res.results[0].data.title : '',
          }
        : null
    );

  const previousPost = await prismic
    .query(
      [
        Prismic.predicates.at('document.type', 'posts'),
        Prismic.predicates.dateBefore(
          'document.first_publication_date',
          post.first_publication_date
        ),
      ],
      { pageSize: 1 }
    )
    .then(res =>
      res.results.length > 0
        ? {
            uid: res.results[0].uid,
            title: res.results[0].data ? res.results[0].data.title : '',
          }
        : null
    );

  return {
    props: { post, preview, readingTime, nextPost, previousPost },
  };
};
