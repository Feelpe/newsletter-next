import { GetServerSideProps, GetStaticPropsContext } from "next"
import { getSession } from "next-auth/react"
import Head from "next/head";
import { RichText } from 'prismic-dom';
import * as prismicH from '@prismicio/helpers'

import { createClient } from "../../services/prismic"

import styles from './post.module.scss'

interface PostProps {
  post: {
    slug: string;
    title: string;
    content: string;
    updatedAt: string;
  }
}

export default function Post({ post }: PostProps) {
  return(
    <>
      <Head>
        <title>{post.title} | Newsletter</title>
      </Head>

      <main className={styles.container}>
        <article className={styles.post}>
          <h1>{post.title}</h1>
          <time>{post.updatedAt}</time>
          {/* {post.content.map((document) => ( */}
            <div 
              className={styles.postContent}
              dangerouslySetInnerHTML={{ __html: post.content }} 
            />
          {/* ))} */}
        </article>
      </main>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({
  previewData, 
  params,
  req
}: GetStaticPropsContext ) => {
  const session = await getSession({ req })
  const { slug } = params;

  // if (!session) {}

  const client = createClient({ previewData });

  const response = await client.getByUID('post', String(slug), {})
  
  const post = {
    slug,
    title: response.data.title,
    content: prismicH.asHTML(response.data.slices[0].items[0].description),
    updatedAt: new Date(response.last_publication_date)
    .toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }
  console.log(JSON.stringify(post, null, 2))

  return {
    props: {
      post,
    }
  }
}