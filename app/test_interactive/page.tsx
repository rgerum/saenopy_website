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
import { DisplayMesh } from "@/components/mesh/display";

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
                  <DisplayMesh />
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
