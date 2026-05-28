import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local", override: true });
dotenv.config({ override: true });

const prisma = new PrismaClient();

const portfolios = [
  {
    title: "The Sacred Vow",
    description: "85mm · f/1.4 · 1/200s · ISO 160",
    imageUrl: "/images/portfolio/wedding-1.jpg",
    category: "Wedding",
    featured: true
  },
  {
    title: "Golden Hour",
    description: "50mm · f/1.2 · 1/320s · ISO 100",
    imageUrl: "/images/portfolio/portrait-1.jpg",
    category: "Portrait",
    featured: true
  },
  {
    title: "Before Forever",
    description: "35mm · f/1.8 · 1/250s · ISO 200",
    imageUrl: "/images/portfolio/prewedding-1.jpg",
    category: "Pre Wedding",
    featured: true
  }
];

const services = [
  {
    title: "Wedding Photography",
    description: "Full day coverage capturing every emotion from getting ready to final send off.",
    price: "₹40,000",
    features: ["Full day coverage", "500+ edited photos", "Private online gallery", "Print-ready files", "30 day delivery"],
    popular: false
  },
  {
    title: "Pre Wedding Shoot",
    description: "Creative couples session crafted uniquely around your love story and vision.",
    price: "₹25,000",
    features: ["3-4 hour session", "2 outfit changes", "150+ edited photos", "Location of choice", "15 day delivery"],
    popular: true
  },
  {
    title: "Cinematic Film",
    description: "Your wedding as a beautifully edited, color graded film you will replay for years.",
    price: "₹20,000",
    features: ["Full day videography", "Highlight reel 5-7 min", "Full length film", "Drone shots if applicable", "60 day delivery"],
    popular: false
  },
  {
    title: "Portrait Sessions",
    description: "Personal branding, family portraits, and individual sessions with curated lighting.",
    price: "₹5,000",
    features: ["2 hour session", "50+ edited photos", "1 location", "Digital delivery", "7 day delivery"],
    popular: false
  },
  {
    title: "Destination Coverage",
    description: "Available for destination weddings across India and internationally.",
    price: "Custom Pricing",
    features: ["Travel included", "Multi-day coverage", "Full photo and video", "Custom package", "Flexible delivery"],
    popular: false
  },
  {
    title: "Albums & Prints",
    description: "Premium flush mount albums and prints crafted to be cherished for generations.",
    price: "₹8,000",
    features: ["Flush mount album", "20-30 spreads", "Premium paper", "Custom cover design", "Doorstep delivery"],
    popular: false
  }
];

const testimonials = [
  {
    clientName: "Prashant Saini",
    rating: 5,
    review: "As Shubham's best friend, I’ve seen his journey from holding a basic camera to becoming an absolute storytelling genius. He shot my cousin's wedding last winter, and the results were purely magical. He has this unique ability to blend into the crowd, capturing those raw, emotional, split-second hugs and laughs that everyone else misses. He doesn't just click pictures; he captures the soul of the celebration. If you want your wedding memories to feel alive every time you look at them, Shubham is the only name you need.",
    approved: true
  },
  {
    clientName: "Amit Saini",
    rating: 5,
    review: "Shubham Singh is not just a photographer; he is a magician behind the lens. The way he covered my brother's wedding was absolutely outstanding. He made the entire couple feel incredibly comfortable, removing all the awkwardness of posing. The cinematic edits and lighting play in his portraits are of international standards. Every single family member was absolutely stunned by the print albums. Highly recommend his work to anyone looking to preserve their lifetime vows.",
    approved: true
  },
  {
    clientName: "Vipul Sharma",
    rating: 5,
    review: "I’ve worked with Shubham on multiple cinematic film projects, and his dedication is unparalleled. He will literally wake up at 4 AM to capture that perfect golden hour dew drop, or stand in the rain to get an epic reflection shot. His cinematic wedding films are structured like premium feature movies, with beautiful transitions, emotional music, and impeccable color grading. A true professional who knows his craft inside out!",
    approved: true
  },
  {
    clientName: "Yogesh Tomar",
    rating: 5,
    review: "Being his brother, I know the relentless effort Shubham puts into every single shoot. He spends countless sleepless nights meticulously color-grading every photo to ensure it matches his signature warm golden aesthetic. When he shot our family gathering, he transformed simple outdoor portraits into premium, magazine-cover-worthy art. His passion is absolute, and it reflects in the glowing eyes of every couple he shoots.",
    approved: true
  },
  {
    clientName: "Navneet Tomar",
    rating: 5,
    review: "Shubham’s growth as a premium visual storyteller has been inspiring. His eye for detail is unmatched; he notices the subtle tear in a father's eye, the soft holding of hands under the table, and the natural laughter of friends. The pre-wedding films he creates are exceptionally poetic and completely customized to each couple's unique vibe. He is extremely patient, polite, and professional—a gem of a person and a master of visual art.",
    approved: true
  },
  {
    clientName: "Yashdeep Sharma",
    rating: 5,
    review: "The absolute best in the business! Shubham Singh captured our family wedding, and he literally turned every single event into a cinematic fairytale. From the vibrant yellow hues of Haldi to the emotional send-off, the storytelling flow in his pictures is beautiful. He doesn't force fake smiles; instead, he captures real, unscripted love. Booking him was the best decision we made for the wedding!",
    approved: true
  }
];

async function main() {
  console.log("Checking database content...");

  const portfolioCount = await prisma.portfolio.count();
  const serviceCount = await prisma.service.count();
  const testimonialCount = await prisma.testimonial.count();

  console.log(`Current Database Counts - Portfolios: ${portfolioCount}, Services: ${serviceCount}, Testimonials: ${testimonialCount}`);

  // 1. Seed Portfolios (Always clean and overwrite with real images)
  console.log("Cleaning old portfolios...");
  await prisma.portfolio.deleteMany({});
  console.log("Seeding Portfolios...");

  const cleanEnv = (v: string | undefined) => v ? v.replace(/^["']|["']$/g, "").trim() : "";
  const supabaseUrl = cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const supabaseAnonKey = cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  for (const item of portfolios) {
    let finalImageUrl = item.imageUrl;

    if (item.imageUrl.startsWith("/images/") && supabaseUrl && supabaseAnonKey) {
      const localPath = path.join("public", item.imageUrl);
      const localFilePath = path.resolve(localPath);
      if (fs.existsSync(localFilePath)) {
        try {
          const fileBuffer = fs.readFileSync(localFilePath);
          const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
          
          const fileExt = item.imageUrl.split(".").pop();
          const fileName = path.basename(item.imageUrl, `.${fileExt}`);
          const storagePath = `portfolio/${fileName}_seed.${fileExt}`;
          
          console.log(`Uploading local portfolio file '${item.imageUrl}' to Supabase Storage...`);
          const { error: uploadErr } = await supabaseClient.storage
            .from("portfolio-images")
            .upload(storagePath, fileBuffer, {
              contentType: `image/${fileExt === "jpg" ? "jpeg" : fileExt}`,
              cacheControl: "31536000",
              upsert: true
            });

          if (!uploadErr) {
            const { data: { publicUrl } } = supabaseClient.storage
              .from("portfolio-images")
              .getPublicUrl(storagePath);
            finalImageUrl = publicUrl;
            console.log(`Uploaded portfolio item to Supabase. Public URL: ${publicUrl}`);
          } else {
            console.warn(`Supabase Storage upload warning for portfolio '${item.imageUrl}':`, uploadErr.message);
          }
        } catch (uploadException: unknown) {
          const errMsg = uploadException instanceof Error ? uploadException.message : String(uploadException);
          console.warn(`Storage exception for portfolio '${item.imageUrl}':`, errMsg);
        }
      } else {
        console.warn(`Local file path '${localFilePath}' does not exist for portfolio item.`);
      }
    }

    await prisma.portfolio.create({
      data: {
        ...item,
        imageUrl: finalImageUrl
      }
    });
  }
  console.log(`Successfully seeded ${portfolios.length} portfolio items.`);

  // 2. Seed Services if empty
  if (serviceCount === 0) {
    console.log("Seeding Services...");
    for (const item of services) {
      await prisma.service.create({ data: item });
    }
    console.log(`Successfully seeded ${services.length} services.`);
  } else {
    console.log("Services already exist. Skipping services seed.");
  }

  // 3. Seed Site Assets
  console.log("Seeding Site Assets...");

  const assetsToSeed = [
    {
      key: "hero-bg",
      localPath: "public/images/hero/hero-landing.jpeg",
      contentType: "image/jpeg",
      altText: "Shubham Singh Hero Background",
      fallbackUrl: ""
    },
    {
      key: "about-photo-1",
      localPath: "public/images/about/about-portrait-1.jpeg",
      contentType: "image/jpeg",
      altText: "Shubham Singh Photographer Main portrait",
      fallbackUrl: ""
    },
    {
      key: "about-photo-2",
      localPath: "public/images/about/about-portrait-2.png",
      contentType: "image/png",
      altText: "Shubham Singh visual storyteller second portrait",
      fallbackUrl: ""
    },
    {
      key: "testimonial-story-bg",
      localPath: "",
      contentType: "",
      altText: "Engagement Shoot Backdrop",
      fallbackUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=82"
    },
    {
      key: "testimonial-avatar-whatsapp",
      localPath: "",
      contentType: "",
      altText: "Syed Arham Nizami avatar",
      fallbackUrl: "https://i.pravatar.cc/100?img=68"
    },
    {
      key: "testimonial-avatar-instagram-story",
      localPath: "",
      contentType: "",
      altText: "Client Instagram Story avatar",
      fallbackUrl: "https://i.pravatar.cc/100?img=53"
    },
    {
      key: "testimonial-avatar-instagram-dm",
      localPath: "",
      contentType: "",
      altText: "Ghazna Bhabhi profile avatar",
      fallbackUrl: "https://i.pravatar.cc/100?img=43"
    }
  ];

  for (const assetInfo of assetsToSeed) {
    const existing = await prisma.siteAsset.findUnique({
      where: { key: assetInfo.key }
    });

    if (existing) {
      console.log(`Asset '${assetInfo.key}' already exists in database. Skipping.`);
      continue;
    }

    let finalImageUrl = assetInfo.fallbackUrl;

    if (assetInfo.localPath && supabaseUrl && supabaseAnonKey) {
      const localFilePath = path.resolve(assetInfo.localPath);
      if (fs.existsSync(localFilePath)) {
        try {
          const fileBuffer = fs.readFileSync(localFilePath);
          const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
          
          const fileExt = assetInfo.localPath.split(".").pop();
          const storagePath = `site-assets/${assetInfo.key}_seed.${fileExt}`;
          
          console.log(`Uploading local asset file for '${assetInfo.key}' to Supabase Storage...`);
          const { error: uploadErr } = await supabaseClient.storage
            .from("portfolio-images")
            .upload(storagePath, fileBuffer, {
              contentType: assetInfo.contentType,
              cacheControl: "31536000",
              upsert: true
            });

          if (!uploadErr) {
            const { data: { publicUrl } } = supabaseClient.storage
              .from("portfolio-images")
              .getPublicUrl(storagePath);
            finalImageUrl = publicUrl;
            console.log(`Uploaded '${assetInfo.key}' to Supabase. Public URL: ${publicUrl}`);
          } else {
            console.warn(`Supabase Storage upload warning for '${assetInfo.key}':`, uploadErr.message);
          }
        } catch (uploadException: unknown) {
          const errMsg = uploadException instanceof Error ? uploadException.message : String(uploadException);
          console.warn(`Storage exception for '${assetInfo.key}':`, errMsg);
        }
      } else {
        console.warn(`Local file path '${assetInfo.localPath}' does not exist for '${assetInfo.key}'.`);
      }
    }

    if (finalImageUrl) {
      await prisma.siteAsset.create({
        data: {
          key: assetInfo.key,
          imageUrl: finalImageUrl,
          altText: assetInfo.altText
        }
      });
      console.log(`Successfully seeded SiteAsset table for '${assetInfo.key}'.`);
    } else {
      console.error(`Could not seed '${assetInfo.key}' due to missing image source.`);
    }
  }

  // 4. Seed Testimonials (standard and multi-template social ones)
  console.log("Cleaning old standard testimonials...");
  await prisma.testimonial.deleteMany({
    where: { type: "standard" }
  });

  console.log("Seeding standard Testimonials...");
  for (const item of testimonials) {
    await prisma.testimonial.create({
      data: {
        ...item,
        type: "standard"
      }
    });
  }
  console.log(`Successfully seeded ${testimonials.length} approved testimonials.`);

  console.log("Cleaning old social testimonials...");
  await prisma.testimonial.deleteMany({
    where: {
      type: {
        in: ["whatsapp", "instagram_story", "instagram_dm", "instagram", "google review", "facebook", "other"]
      }
    }
  });

  console.log("Seeding Multi-Template Social Testimonials with Proof Screenshots...");
  if (true) {
    let waProofUrl = "";
    let storyProofUrl = "";
    let dmProofUrl = "";

    if (supabaseUrl && supabaseAnonKey) {
      const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

      const uploads = [
        { localPath: "public/images/testimonials/feedback-1.jpg", key: "feedback-1", dest: "testimonials/feedback-1_seed.jpg", contentType: "image/jpeg" },
        { localPath: "public/images/testimonials/feedback-2.jpg", key: "feedback-2", dest: "testimonials/feedback-2_seed.jpg", contentType: "image/jpeg" },
        { localPath: "public/images/testimonials/feedback-3.jpg", key: "feedback-3", dest: "testimonials/feedback-3_seed.jpg", contentType: "image/jpeg" }
      ];

      for (const upl of uploads) {
        const localFilePath = path.resolve(upl.localPath);
        if (fs.existsSync(localFilePath)) {
          try {
            const fileBuffer = fs.readFileSync(localFilePath);
            console.log(`Uploading local proof screenshot for '${upl.key}' to Supabase Storage...`);
            const { error: uploadErr } = await supabaseClient.storage
              .from("portfolio-images")
              .upload(upl.dest, fileBuffer, {
                contentType: upl.contentType,
                cacheControl: "31536000",
                upsert: true
              });

            if (!uploadErr) {
              const { data: { publicUrl } } = supabaseClient.storage
                .from("portfolio-images")
                .getPublicUrl(upl.dest);
              if (upl.key === "feedback-1") waProofUrl = publicUrl;
              if (upl.key === "feedback-2") storyProofUrl = publicUrl;
              if (upl.key === "feedback-3") dmProofUrl = publicUrl;
              console.log(`Uploaded proof screenshot '${upl.key}' to Supabase: ${publicUrl}`);
            } else {
              console.warn(`Supabase Storage upload warning for proof '${upl.key}':`, uploadErr.message);
            }
          } catch (uploadException: unknown) {
            const errMsg = uploadException instanceof Error ? uploadException.message : String(uploadException);
            console.warn(`Storage exception for proof '${upl.key}':`, errMsg);
          }
        }
      }
    }

    const socialTestimonials = [
      {
        clientName: "Arhum & Kashish",
        rating: 5,
        review: "Hello My Dear Team,\n\nTomorrow is a very special day for me as it is my reception and also the last day of this beautiful journey with all of you.\n\nI truly want to say from my heart that each one of you is an amazing human being and an incredible team.\n\nYou all have been so polite, supportive, and caring throughout, and I will always remember that.\n\nA special and big appreciation for Shubham, who truly stands tall in his politeness, care, and genuine dedication to clients. I have honestly never seen someone like him.",
        type: "whatsapp",
        imageUrl: waProofUrl || null,
        extraData: null,
        approved: true
      },
      {
        clientName: "Aligarh Engagement",
        rating: 5,
        review: "We truly don't have enough words to express our gratitude for the incredible work you did at my brother's engagement. From the smallest details to the grandest moment, everything was handled with such perfection. Thank you for preserving our forever so beautifully.",
        type: "instagram",
        imageUrl: storyProofUrl || null,
        extraData: null,
        approved: true
      },
      {
        clientName: "sayyad_muskaan073",
        rating: 5,
        review: "Shubham Singh is truly amazing when it comes to photography. The pictures feel so natural and full of life. Every shot captures real emotions perfectly, without looking forced.\n\nWhat I loved the most is his kind and humble nature. He makes you feel so comfortable. They create memories you'll always cherish.\n\nRegards, GHAZNA BHABHI",
        type: "instagram",
        imageUrl: dmProofUrl || null,
        extraData: null,
        approved: true
      }
    ];

    for (const item of socialTestimonials) {
      await prisma.testimonial.create({ data: item });
    }
    console.log(`Successfully seeded ${socialTestimonials.length} social template testimonials with proof screenshots.`);
  } else {
    console.log("Social testimonials already exist. Skipping social seed.");
  }

  console.log("Database seeding verification completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seeding failed with error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
