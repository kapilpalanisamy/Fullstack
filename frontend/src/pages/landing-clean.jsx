import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import companies from "../data/companies.json";
import faqs from "../data/faq.json";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <main className="flex flex-col gap-10 sm:gap-20 py-10 sm:py-20">
      <section className="text-center fade-in">
        <h1 className="flex flex-col items-center justify-center gradient-title font-extrabold text-4xl sm:text-6xl lg:text-8xl tracking-tighter py-4 slide-up">
          Find Your Dream Job
          <span className="flex items-center gap-2 sm:gap-6 scale-in">
            with AI Power
            <img
              src="/logo.png"
              className="h-14 sm:h-24 lg:h-32 bounce-in"
              alt="RizeOS Jobs Logo"
            />
          </span>
        </h1>
        <p className="text-gray-300 sm:mt-4 text-xs sm:text-xl fade-in" style={{animationDelay: '0.3s'}}>
          Experience the future of job searching with AI-powered matching and Web3 integration
        </p>
      </section>
      
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-4 slide-up" style={{animationDelay: '0.6s'}}>
        <Link to={"/jobs"} className="w-full sm:w-auto">
          <Button variant="blue" size="xl" className="w-full sm:w-auto hover-lift">
            Find Jobs
          </Button>
        </Link>
        <Link to={"/post-job"} className="w-full sm:w-auto">
          <Button variant="destructive" size="xl" className="w-full sm:w-auto hover-lift">
            Post a Job
          </Button>
        </Link>
      </div>
      
      <Carousel
        aria-label="Partner companies"
        plugins={[
          Autoplay({
            delay: 2000,
          }),
        ]}
        className="w-full py-10 fade-in"
        style={{animationDelay: '0.9s'}}
      >
        <CarouselContent className="flex gap-5 sm:gap-20 items-center">
          {companies.map(({ name, id, path }) => (
            <CarouselItem key={id} className="basis-1/3 lg:basis-1/6">
              <img
                src={path}
                alt={`${name} company logo`}
                className="h-9 sm:h-14 object-contain hover:scale-110 transition-transform duration-300"
                loading="lazy"
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <img src="/banner.jpeg" className="w-full rounded-lg shadow-lg" alt="Job Portal Banner" />

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 fade-in" style={{animationDelay: '1.2s'}} aria-labelledby="features-heading">
        <h2 id="features-heading" className="sr-only">Platform Features</h2>
        <Card className="transform transition-transform duration-300 hover:scale-105 hover-lift">
          <CardHeader>
            <CardTitle className="font-bold text-lg sm:text-xl">For Job Seekers</CardTitle>
          </CardHeader>
          <CardContent className="text-sm sm:text-base">
            Search and apply for jobs with AI-powered matching, track applications, and get career insights.
          </CardContent>
        </Card>
        <Card className="transform transition-transform duration-300 hover:scale-105 hover-lift">
          <CardHeader>
            <CardTitle className="font-bold text-lg sm:text-xl">For Employers</CardTitle>
          </CardHeader>
          <CardContent className="text-sm sm:text-base">
            Post jobs with Web3 payments, manage applications, and find the best candidates using AI.
          </CardContent>
        </Card>
      </section>

      <section aria-labelledby="faq-heading" className="fade-in" style={{animationDelay: '1.5s'}}>
        <h2 id="faq-heading" className="text-2xl font-bold text-center mb-6">Frequently Asked Questions</h2>
        <Accordion type="multiple" className="w-full px-4">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index + 1}`} 
              className="border-b border-gray-800"
            >
              <AccordionTrigger 
                className="text-left hover:text-blue-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                aria-expanded="false"
              >
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-300 text-sm sm:text-base">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </main>
  );
};

export default LandingPage;
