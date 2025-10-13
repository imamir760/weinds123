import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Bot,
  Briefcase,
  FileText,
  Search,
  Star,
  Users,
} from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const featureList = [
  {
    icon: <Bot className="w-8 h-8 text-primary" />,
    title: 'AI Career OS',
    description:
      'Your personal AI career mentor for specializations, learning roadmaps, and resources based on your goals.',
  },
  {
    icon: <FileText className="w-8 h-8 text-primary" />,
    title: 'AI Resume Builder',
    description:
      'Effortlessly reformat raw text into professional resume designs and save them to the cloud.',
  },
  {
    icon: <Search className="w-8 h-8 text-primary" />,
    title: 'Smart Job Finder',
    description:
      'Discover relevant jobs with a compatibility score based on your unique skills and experience.',
  },
  {
    icon: <Briefcase className="w-8 h-8 text-primary" />,
    title: 'AI Job Descriptions',
    description:
      'Employers can generate structured and effective job descriptions from unstructured text instantly.',
  },
  {
    icon: <Users className="w-8 h-8 text-primary" />,
    title: 'Talent Pool Access',
    description:
      'Browse and filter through a rich pool of campus and fresher talent for your hiring needs.',
  },
  {
    icon: <Star className="w-8 h-8 text-primary" />,
    title: 'AI-Powered Screening',
    description:
      'Utilize AI skill tests and conversational interviews with semantic scoring for better hiring decisions.',
  },
];

const testimonials = [
  {
    name: 'Sarah L.',
    role: 'Software Engineer',
    avatar: PlaceHolderImages[1],
    comment:
      "Weinds' AI mentor gave me a clear roadmap to transition into machine learning. The job finder then matched me with my dream job in weeks!",
  },
  {
    name: 'David Chen',
    role: 'HR Manager, TechCorp',
    avatar: PlaceHolderImages[2],
    comment:
      'The AI screening and talent pool features have revolutionized our campus hiring. We now find qualified candidates 50% faster.',
  },
  {
    name: 'Priya Sharma',
    role: 'TPO, Elite University',
    avatar: PlaceHolderImages[3],
    comment:
      'Weinds has been a game-changer for our students. The resume builder and career OS empower them to be job-ready.',
  },
];

export default function Home() {

  return (
    <div className="flex flex-col">
      <section className="py-20 sm:py-32 bg-grid-slate-100">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl lg:text-7xl font-extrabold text-foreground mt-4 mb-6 font-headline tracking-tight">
              Where Ancient Wisdom
              <br /> Meets <span className="text-primary">Modern Ambition.</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Inspired by India&apos;s rich heritage of knowledge, Weinds uses AI to
              forge new career paths for the next generation of builders and
              thinkers.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/candidate/signup">I'm a Candidate</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/employer/signup">I'm an Employer</Link>
              </Button>
            </div>
            <div className="mt-6 text-sm">
                <Link href="/tpo/signup" className="text-muted-foreground hover:text-primary transition-colors">
                    Are you an Institute? Start here.
                </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 sm:py-24 bg-white/50 dark:bg-card/50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold font-headline mb-4">
              An AI-Powered Ecosystem for Success
            </h2>
            <p className="text-muted-foreground text-lg mb-12">
              From personalized career guidance to intelligent recruitment,
              Weinds provides the tools you need to thrive.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featureList.map((feature, index) => (
              <Card
                key={index}
                className="bg-card/70 backdrop-blur-sm border-border/50 hover:border-primary/50 hover:shadow-lg transition-all"
              >
                <CardHeader>
                  <div className="flex items-center gap-4">
                    {feature.icon}
                    <CardTitle className="text-xl font-semibold font-headline">
                      {feature.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="testimonials" className="py-20 sm:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold font-headline mb-4">
              Trusted by Professionals and Institutions
            </h2>
            <p className="text-muted-foreground text-lg mb-12">
              Hear what our users have to say about their experience with Weinds.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <Card
                key={i}
                className="flex flex-col justify-between bg-card/70 backdrop-blur-sm border-border/50"
              >
                <CardContent className="pt-6">
                  <p className="italic text-foreground mb-4">
                    "{testimonial.comment}"
                  </p>
                </CardContent>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage
                        src={testimonial.avatar.imageUrl}
                        alt={testimonial.avatar.description}
                        data-ai-hint={testimonial.avatar.imageHint}
                      />
                      <AvatarFallback>
                        {testimonial.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-foreground">
                        {testimonial.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="container mx-auto px-4">
          <div className="bg-primary text-primary-foreground p-12 rounded-2xl text-center shadow-2xl">
            <h2 className="text-3xl lg:text-4xl font-bold font-headline mb-4">
              Ready to Elevate Your Career or Team?
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              Join Weinds today and unlock the power of AI for your professional
              journey or recruitment process.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="bg-accent text-accent-foreground hover:bg-accent/90"
              asChild
            >
              <Link href="/candidate/signup">
                Sign Up Now <ArrowRight className="ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
