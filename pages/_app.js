import '../styles/globals.css'
import Head from 'next/head'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        {/* 复用现有的样式文件 - public 目录下的文件需要通过 link 标签引用 */}
        <link rel="stylesheet" href="/styles.css" />
        <link rel="stylesheet" href="/header-footer.css" />
        <link rel="stylesheet" href="/content-styles.css" />
        <link rel="stylesheet" href="/content.css" />
      </Head>
      <Component {...pageProps} />
    </>
  )
}