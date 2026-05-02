import "dotenv/config";
import { campaignStore } from "../src/lib/storage.js";
import { randomUUID } from "node:crypto";

async function main() {
  const now = new Date().toISOString();

  const seeds = [
    {
      id: randomUUID(),
      slug: "waqof-al-quran",
      title: "Waqof Al-Qur'an",
      description:
        "Wakafkan mushaf Al-Qur'an untuk santri dan jamaah Yayasan Islam Al Muzayyin Gadung. Setiap mushaf yang Anda wakafkan akan dibaca, dipelajari, dan menjadi amal jariyah yang tak terputus.",
      type: "mushaf" as const,
      targetAmount: 85_000_000,
      collectedAmount: 0,
      donorCount: 0,
      startDate: now,
      endDate: undefined,
      active: true,
      coverImage: undefined,
      createdAt: now,
    },
    {
      id: randomUUID(),
      slug: "santunan-yatim-piatu",
      title: "Santunan Yatim Piatu",
      description:
        "Bantu meringankan beban anak yatim dan piatu di lingkungan Yayasan Al Muzayyin. Donasi Anda dipakai untuk biaya pendidikan, kebutuhan harian, dan santunan rutin bulanan.",
      type: "uang" as const,
      targetAmount: 100_000_000,
      collectedAmount: 0,
      donorCount: 0,
      startDate: now,
      endDate: undefined,
      active: true,
      coverImage: undefined,
      createdAt: now,
    },
    {
      id: randomUUID(),
      slug: "donasi-pembangunan",
      title: "Donasi Pembangunan",
      description:
        "Dukung pembangunan dan pengembangan sarana ibadah serta pendidikan Yayasan Islam Al Muzayyin Gadung — masjid, ruang belajar, dan fasilitas pendukung lainnya.",
      type: "uang" as const,
      targetAmount: 500_000_000,
      collectedAmount: 0,
      donorCount: 0,
      startDate: now,
      endDate: undefined,
      active: true,
      coverImage: undefined,
      createdAt: now,
    },
    {
      id: randomUUID(),
      slug: "waqof-tanah",
      title: "Waqof Tanah",
      description:
        "Wakaf tanah untuk perluasan area Yayasan Al Muzayyin — kompleks pendidikan, masjid, dan asrama santri. Wakaf tanah adalah amal jariyah dengan pahala yang terus mengalir selama tanah itu dimanfaatkan.",
      type: "uang" as const,
      targetAmount: 1_000_000_000,
      collectedAmount: 0,
      donorCount: 0,
      startDate: now,
      endDate: undefined,
      active: true,
      coverImage: undefined,
      createdAt: now,
    },
  ];

  for (const c of seeds) {
    const existing = await campaignStore.findById(c.slug);
    if (existing) {
      console.log(`[skip] ${c.slug} sudah ada`);
      continue;
    }
    await campaignStore.save(c);
    console.log(`[seed] ${c.slug}`);
  }
  console.log("Seeding selesai.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
