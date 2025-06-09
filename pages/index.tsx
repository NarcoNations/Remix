import Head from 'next/head';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Gameplay from '../components/Gameplay';
import Components from '../components/BoxContents';
import Kickstarter from '../components/Kickstarter';
import Mission from '../components/Mission';
import CTA from '../components/CTA';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <>
      <Head>
        <title>NarcoNations | Blood Money: Crime vs Karma</title>
      </Head>
      <Hero />
      <Features />
      <Gameplay />
      <Components />
      <Kickstarter />
      <Mission />
      <CTA />
      <Footer />
    </>
  );
}
