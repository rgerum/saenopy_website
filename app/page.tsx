import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Download,
  Github,
  BookOpen,
  Heart,
  Mail,
  Twitter,
  Linkedin,
  Globe,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Saenopy - 3D traction force microscopy",
  description:
    "An open-source software for calculating 3D traction forces in cell mechanics research",
  alternates: {
    canonical: "https://saenopy.com",
  },
};

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0  mx-auto">
          <div className="flex gap-6 md:gap-10 items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="inline-block font-bold text-xl">
                <Image
                  alt="Saenopy logo"
                  height={50}
                  width={100}
                  src={"Logo.png"}
                />
              </span>
            </Link>
            <nav className="hidden md:flex gap-6">
              <Link
                href="#features"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Features
              </Link>
              <Link
                href="#publications"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Publications
              </Link>
              <Link
                href="#consulting"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Consulting
              </Link>
              <Link
                href="#donate"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Donate
              </Link>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-2">
              <Link
                href="https://github.com/rgerum/saenopy/"
                target="_blank"
                rel="noreferrer"
              >
                <Button variant="ghost" size="icon">
                  <Github className="h-5 w-5" />
                  <span className="sr-only">GitHub</span>
                </Button>
              </Link>
              <Link
                href="https://saenopy.readthedocs.io"
                target="_blank"
                rel="noreferrer"
              >
                <Button variant="ghost" size="icon">
                  <BookOpen className="h-5 w-5" />
                  <span className="sr-only">Documentation</span>
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-background to-muted">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Calculate 3D Traction Forces with Saenopy
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    An open-source software for calculating 3D traction forces
                    in cell mechanics research, backed by a Nature Physics
                    publication.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="#download">
                    <Button size="lg" className="gap-1">
                      <Download className="h-5 w-5" />
                      Download
                    </Button>
                  </Link>
                  <Link
                    href="https://saenopy.readthedocs.io"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button size="lg" variant="outline">
                      Documentation
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
              <Image
                src="/HeroCell.png"
                width={550}
                height={550}
                alt="Cell visualization placeholder"
                className="mx-auto aspect-square overflow-hidden rounded-xl object-cover"
              />
            </div>
          </div>
        </section>
        <section
          id="download"
          className="w-full py-12 md:py-24 lg:py-32 bg-background "
        >
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Download Saenopy
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Get started with Saenopy today. Available for Windows and
                  Linux.
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Link
                    href="https://github.com/rgerum/saenopy/releases/download/v1.0.6/saenopy.exe"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button size="lg" className="w-full gap-1">
                      <Download className="h-5 w-5" />
                      Windows
                    </Button>
                  </Link>
                  <Link
                    href="https://github.com/rgerum/saenopy/releases/download/v1.0.6/saenopy"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button size="lg" className="w-full gap-1">
                      <Download className="h-5 w-5" />
                      Linux
                    </Button>
                  </Link>
                </div>
                <p className="text-xs text-muted-foreground">
                  You can also install via pip: <code>pip install saenopy</code>
                </p>
              </div>
            </div>
          </div>
        </section>
        <section
          id="features"
          className="w-full py-12 md:py-24 lg:py-32 bg-muted"
        >
          <div className="container px-4 md:px-6  mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Features
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Saenopy provides powerful tools for cell mechanics research.
                </p>
              </div>
              <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 items-stretch">
                <Card>
                  <CardHeader>
                    <CardTitle>3D Traction Force Microscopy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>
                      Calculate traction forces in three dimensions with high
                      accuracy.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Non-linear Material Models</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>
                      Support for various non-linear material models for
                      accurate cell mechanics analysis.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Visualization Tools</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>
                      Comprehensive visualization tools to analyze and present
                      your results.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Python API</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>
                      Fully scriptable with a comprehensive Python API for
                      automation and integration.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>GUI Interface</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>
                      User-friendly graphical interface for researchers without
                      programming experience.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Open Source</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>
                      100% open source and free to use, modify, and distribute
                      under MIT license.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
        <section
          id="integrations"
          className="w-full py-12 md:py-24 lg:py-32 bg-background"
        >
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Integrations
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Aside from Saenopy's main use for 3D traction force
                  microscopy, we provide integrations to related methods to
                  assess cellular forces.
                </p>
              </div>
              <div className="mx-auto flex max-w-5xl items-stretch gap-6 py-12 flex-col">
                <Card className="flex flex-col md:flex-row">
                  <div className="flex flex-col flex-[2]">
                    <CardHeader>
                      <CardTitle className="text-left">Spheroid</CardTitle>
                      <CardDescription className="text-left">
                        3D traction force microscopy on multicellular aggregates
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="text-left flex-grow">
                      <p className="mb-4">
                        Analyze forces in multicellular aggregates (so-called
                        spheroids) embedded in 3D biopolymer networks.
                      </p>
                      <p className="text-sm text-muted-foreground mt-4">
                        Mark C., Grundy T., Strissel P., et al. (2020).
                        "Collective forces of tumor spheroids in
                        three-dimensional biopolymer networks". In eLife
                        9:e51912.
                      </p>
                    </CardContent>
                    <CardFooter className="mt-auto">
                      <Link
                        href="https://github.com/christophmark/jointforces"
                        target="_blank"
                        rel="noreferrer"
                        className="w-full"
                      >
                        <Button variant="outline" className="w-full">
                          <Github className="mr-2 h-4 w-4" />
                          View on GitHub
                        </Button>
                      </Link>
                    </CardFooter>
                  </div>
                  <CardImage src={"/StainedOrganoid_icon.png"} />
                </Card>
                <Card className="flex flex-col md:flex-row">
                  <div className="flex flex-col flex-[2]">
                    <CardHeader>
                      <CardTitle className="text-left">Orientation</CardTitle>
                      <CardDescription className="text-left">
                        Fiber alignment as a proxy for force
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="text-left flex-grow">
                      <p className="mb-4">
                        Use fiber alignment as a proxy for force when material
                        properties are not available.
                      </p>
                      <p className="text-sm text-muted-foreground mt-4">
                        Böhringer D., Bauer A., Moravec I., et al. (2023).
                        "Fiber alignment in 3D collagen networks as a
                        biophysical marker for cell contractility". Matrix
                        Biology, 124, pp.39-48.
                      </p>
                    </CardContent>
                    <CardFooter className="mt-auto">
                      <Link
                        href="https://github.com/davidbhr/CompactionAnalyzer"
                        target="_blank"
                        rel="noreferrer"
                        className="w-full"
                      >
                        <Button variant="outline" className="w-full">
                          <Github className="mr-2 h-4 w-4" />
                          View on GitHub
                        </Button>
                      </Link>
                    </CardFooter>
                  </div>
                  <CardImage src={"/CellFibers.png"} />
                </Card>
                <Card className="flex  flex-col md:flex-row">
                  <div className="flex flex-col flex-[2]">
                    <CardHeader>
                      <CardTitle className="text-left">pyTFM</CardTitle>
                      <CardDescription className="text-left">
                        2D traction force and monolayer stress microscopy
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="text-left flex-grow">
                      <p className="mb-4">
                        Analyze force generation and stresses in cell colonies
                        and confluent cell layers growing on a 2-dimensional
                        surface.
                      </p>
                      <p className="text-sm text-muted-foreground mt-4">
                        Bauer A., Prechová M., Fischer L., et al. (2021).
                        "pyTFM: A tool for traction force and monolayer stress
                        microscopy". PLoS computational biology, 17(6),
                        e1008364.
                      </p>
                    </CardContent>
                    <CardFooter className="mt-auto">
                      <Link
                        href="https://github.com/fabrylab/pyTFM"
                        target="_blank"
                        rel="noreferrer"
                        className="w-full"
                      >
                        <Button variant="outline" className="w-full">
                          <Github className="mr-2 h-4 w-4" />
                          View on GitHub
                        </Button>
                      </Link>
                    </CardFooter>
                  </div>
                  <CardImage src={"/pyTFM_WTKO.png"} />
                </Card>
              </div>
            </div>
          </div>
        </section>
        <section id="team" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col space-y-4 justify-center text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Meet the Team
                </h2>
                <p className="text-muted-foreground md:text-xl">
                  The brilliant minds behind Saenopy and its related projects.
                </p>
              </div>
              <div className="mx-auto grid max-w-5xl items-stretch gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
                <Card className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-20 w-20 border-4 border-background">
                        <AvatarImage
                          src="/richard-gerum.jpg"
                          alt="Richard Gerum"
                        />
                        <AvatarFallback>RG</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-left">
                          Richard Gerum
                        </CardTitle>
                        <CardDescription className="text-left">
                          Lead Developer
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="text-left flex-grow">
                    <p>
                      Creator of Saenopy, pylustrator, and cameratransform.
                      Specializes in scientific software development and data
                      visualization.
                    </p>
                  </CardContent>
                  <CardFooter className="flex gap-2 mt-auto">
                    <Link
                      href="https://github.com/rgerum/"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Button variant="outline" size="icon">
                        <Github className="h-4 w-4" />
                        <span className="sr-only">GitHub</span>
                      </Button>
                    </Link>
                    <Link
                      href="https://twitter.com/RichardGerum"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Button variant="outline" size="icon">
                        <Twitter className="h-4 w-4" />
                        <span className="sr-only">Twitter</span>
                      </Button>
                    </Link>
                    <Link
                      href="https://www.linkedin.com/in/richard-gerum-77bb3987/"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Button variant="outline" size="icon">
                        <Linkedin className="h-4 w-4" />
                        <span className="sr-only">LinkedIn</span>
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
                <Card className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-20 w-20 border-4 border-background">
                        <AvatarImage
                          src="/christoph-mark.jpg"
                          alt="Christoph Mark"
                        />
                        <AvatarFallback>CM</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-left">
                          Christoph Mark
                        </CardTitle>
                        <CardDescription className="text-left">
                          Physicist & Developer
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="text-left flex-grow">
                    <p>
                      Physicist focused on time series analysis and complex
                      systems. Creator of jointforces for analyzing
                      multicellular aggregates.
                    </p>
                  </CardContent>
                  <CardFooter className="flex gap-2 mt-auto">
                    <Link
                      href="https://github.com/christophmark/"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Button variant="outline" size="icon">
                        <Github className="h-4 w-4" />
                        <span className="sr-only">GitHub</span>
                      </Button>
                    </Link>
                    <Link
                      href="https://artifact-research.com"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Button variant="outline" size="icon">
                        <Globe className="h-4 w-4" />
                        <span className="sr-only">Website</span>
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
                <Card className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-20 w-20 border-4 border-background">
                        <AvatarImage
                          src="/David-Boehringer.jpg"
                          alt="David Böhringer"
                        />
                        <AvatarFallback>DB</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-left">
                          David Böhringer
                        </CardTitle>
                        <CardDescription className="text-left">
                          Developer & Researcher
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="text-left flex-grow">
                    <p>
                      Developer of CompactionAnalyzer for fiber alignment
                      analysis. Specializes in biophysical markers for cell
                      contractility.
                    </p>
                  </CardContent>
                  <CardFooter className="flex gap-2 mt-auto">
                    <Link
                      href="https://github.com/davidbhr/"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Button variant="outline" size="icon">
                        <Github className="h-4 w-4" />
                        <span className="sr-only">GitHub</span>
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        </section>
        <section
          id="publications"
          className="w-full py-12 md:py-24 lg:py-32 bg-background"
        >
          <div className="container px-4 md:px-6  mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Publications
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Saenopy is backed by peer-reviewed research in leading
                  scientific journals.
                </p>
              </div>
              <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Nature Physics Publication</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">
                      Our primary publication in Nature Physics describes the
                      methodology and validation of Saenopy.
                    </p>
                    <Image
                      src="/PaperNature.png"
                      width={400}
                      height={200}
                      alt="Nature Physics publication"
                      className="mx-auto aspect-video overflow-hidden rounded-xl object-cover"
                    />
                  </CardContent>
                  <CardFooter>
                    <Link
                      href="https://doi.org/10.1038/s41567-024-02632-8"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Button variant="outline">Read Publication</Button>
                    </Link>
                  </CardFooter>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Citations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">
                      Saenopy has been cited by numerous publications in the
                      field of cell mechanics.
                    </p>
                    <Image
                      src="/placeholder.svg?height=200&width=400"
                      width={400}
                      height={200}
                      alt="Citations placeholder"
                      className="mx-auto aspect-video overflow-hidden rounded-xl object-cover"
                    />
                  </CardContent>
                  <CardFooter>
                    <Link
                      href="https://github.com/rgerum/saenopy/"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Button variant="outline">View Citations</Button>
                    </Link>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        </section>
        <section
          id="consulting"
          className="w-full py-12 md:py-24 lg:py-32 bg-muted"
        >
          <div className="container px-4 md:px-6  mx-auto">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <Image
                src="/Consulting.png"
                width={550}
                height={550}
                alt="Consulting services placeholder"
                className="mx-auto aspect-square overflow-hidden rounded-xl object-cover"
              />
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                    Consulting Services
                  </h2>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Get a head start with expert consulting from the Saenopy
                    development team.
                  </p>
                </div>
                <ul className="grid gap-2 py-4">
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-primary" />
                    <span>
                      Implementation assistance for your specific research needs
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-primary" />
                    <span>Custom feature development and integration</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-primary" />
                    <span>Training and workshops for your research team</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-primary" />
                    <span>Ongoing support and troubleshooting</span>
                  </li>
                </ul>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="mailto:support@saenopy.com">
                    <Button size="lg" className="gap-1">
                      <Mail className="h-5 w-5" />
                      Contact Us
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section
          id="donate"
          className="w-full py-12 md:py-24 lg:py-32 bg-background"
        >
          <div className="container px-4 md:px-6  mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Support Development
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Saenopy is 100% open source. Your donations help us continue
                  development and add new features.
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <Button className="w-full gap-1" asChild={true}>
                  <Link href={"https://donate.stripe.com/dR6aGrepV6FT0lG144"}>
                    <Heart className="h-5 w-5" />
                    Donate
                  </Link>
                </Button>
                {/*
                <Tabs defaultValue="one-time" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="one-time">One-time</TabsTrigger>
                    <TabsTrigger value="monthly">Monthly</TabsTrigger>
                  </TabsList>
                  <TabsContent value="one-time" className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                      <Button variant="outline">$5</Button>
                      <Button variant="outline">$10</Button>
                      <Button variant="outline">$25</Button>
                      <Button variant="outline">$50</Button>
                      <Button variant="outline">$100</Button>
                      <Button variant="outline">Custom</Button>
                    </div>
                    <Button className="w-full gap-1" asChild={true}>
                      <Link
                        href={"https://donate.stripe.com/dR6aGrepV6FT0lG144"}
                      >
                        <Heart className="h-5 w-5" />
                        Donate
                      </Link>
                    </Button>
                  </TabsContent>
                  <TabsContent value="monthly" className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                      <Button variant="outline">$2</Button>
                      <Button variant="outline">$5</Button>
                      <Button variant="outline">$10</Button>
                      <Button variant="outline">$20</Button>
                      <Button variant="outline">$50</Button>
                      <Button variant="outline">Custom</Button>
                    </div>
                    <Button className="w-full gap-1" asChild={true}>
                      <Link
                        href={"https://donate.stripe.com/dR6aGrepV6FT0lG144"}
                      >
                        <Heart className="h-5 w-5" />
                        Subscribe
                      </Link>
                    </Button>
                  </TabsContent>
                </Tabs>*/}
                <p className="text-xs text-muted-foreground">
                  Your support helps us continue to develop and maintain
                  Saenopy.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row  mx-auto">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © {new Date().getFullYear()} Saenopy. All rights reserved. Open
            source software under MIT license.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="https://github.com/rgerum/saenopy/"
              target="_blank"
              rel="noreferrer"
            >
              <Button variant="ghost" size="icon">
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Button>
            </Link>
            <Link
              href="https://saenopy.readthedocs.io"
              target="_blank"
              rel="noreferrer"
            >
              <Button variant="ghost" size="icon">
                <BookOpen className="h-5 w-5" />
                <span className="sr-only">Documentation</span>
              </Button>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function CardImage({ src }: { src: string }) {
  return (
    <div
      className={
        "max-md:rounded-b-lg md:rounded-r-lg max-md:h-[150px] md:flex-1"
      }
      style={{
        //boxShadow: "inset white 4px 0px 1px",
        backgroundImage: `url(${src})`,
        backgroundSize: "cover",
        backgroundPosition: "center center",
      }}
    />
  );
}
