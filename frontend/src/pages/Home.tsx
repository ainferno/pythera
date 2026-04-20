import {
  About,
  ContactCTA,
  FAQ,
  Hero,
  HowItWorks,
  Issues,
  Pricing,
} from '../components/landing';

export default function Home() {
  return (
    <>
      <Hero />
      <Issues />
      <HowItWorks />
      <Pricing />
      <About />
      <FAQ />
      <ContactCTA />
    </>
  );
}
