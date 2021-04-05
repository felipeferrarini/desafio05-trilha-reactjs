import { GetStaticProps } from 'next';

import Prismic from '@prismicio/client';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { FaRegCalendar, FaRegUser } from 'react-icons/fa';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { formatDate } from '../utils/format';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
  preview: boolean;
}

export default function Home({
  postsPagination,
  preview,
}: HomeProps): JSX.Element {
  const [posts, setPosts] = useState<Post[]>(postsPagination.results);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  const fetchMorePosts = async (): Promise<void> => {
    const postsData = await fetch(nextPage).then(res => res.json());

    setNextPage(postsData.next_page);
    setPosts(posts.concat(postsData.results));
  };

  return (
    <>
      <Head>
        <title>Início | spacetravelling.</title>
      </Head>
      <main className={`${styles.container} ${commonStyles.wrapperContainer}`}>
        <img src="Logo.svg" alt="logo" />

        <div className={styles.posts}>
          {posts.map(post => (
            <Link href={`/post/${post.uid}`} key={`post-${post.uid}`}>
              <a>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>
                <div>
                  <time>
                    <FaRegCalendar />
                    {formatDate(new Date(post.first_publication_date))}
                  </time>
                  <span>
                    <FaRegUser />
                    {post.data.author}
                  </span>
                </div>
              </a>
            </Link>
          ))}
        </div>

        {nextPage !== null && (
          <button
            onClick={fetchMorePosts}
            type="button"
            className={styles.btnReadMore}
          >
            Carregar mais posts
          </button>
        )}

        {preview && (
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

export const getStaticProps: GetStaticProps = async ({
  preview = false,
  previewData,
}) => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
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
      ref: previewData?.ref ?? null,
    }
  );

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: postsResponse.results,
  };

  return {
    props: { postsPagination, preview },
  };
};
