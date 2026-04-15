<script setup lang="ts">
const contactInfo = [
  {
    icon: 'pi pi-map-marker',
    title: 'Visit Us',
    lines: ['Jl. Merdeka No. 42', 'Bandung, Jawa Barat 40115'],
  },
  {
    icon: 'pi pi-phone',
    title: 'Call Us',
    lines: ['+62 812 3456 7890', 'Mon — Sun: 08.00 — 22.00'],
  },
  {
    icon: 'pi pi-envelope',
    title: 'Email Us',
    lines: ['hello@arlettacafe.id', 'reservations@arlettacafe.id'],
  },
]

const socialLinks = [
  { icon: 'pi pi-instagram', href: '#', label: 'Instagram' },
  { icon: 'pi pi-facebook', href: '#', label: 'Facebook' },
  { icon: 'pi pi-twitter', href: '#', label: 'Twitter' },
  { icon: 'pi pi-whatsapp', href: '#', label: 'WhatsApp' },
]
</script>

<template>
  <section id="contact" class="bg-cream py-24 md:py-32">
    <div class="mx-auto max-w-7xl px-6">
      <!-- Header -->
      <div class="fade-in mb-16 text-center">
        <span class="text-xs font-semibold tracking-[0.25em] text-gold uppercase">
          Get in Touch
        </span>
        <h2 class="font-heading text-brown-800 mt-3 text-4xl font-bold md:text-5xl">Contact Us</h2>
        <div class="bg-gold mx-auto mt-4 h-1 w-16 rounded-full"></div>
      </div>

      <div class="grid gap-12 lg:grid-cols-2">
        <!-- Contact Info -->
        <div class="fade-in-left space-y-8">
          <div
            v-for="info in contactInfo"
            :key="info.title"
            class="group flex items-start gap-5 rounded-xl bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md"
          >
            <div
              class="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gold/15 transition-all duration-300 group-hover:bg-gold"
            >
              <i
                :class="info.icon"
                class="text-gold text-lg transition-colors duration-300 group-hover:text-brown-900"
              ></i>
            </div>
            <div>
              <h4 class="text-brown-800 mb-1 font-semibold">{{ info.title }}</h4>
              <p
                v-for="line in info.lines"
                :key="line"
                class="text-brown-500 text-sm leading-relaxed"
              >
                {{ line }}
              </p>
            </div>
          </div>

          <!-- Social Links -->
          <div class="flex items-center gap-4 pt-4">
            <span class="text-brown-400 text-sm font-medium">Follow us:</span>
            <a
              v-for="social in socialLinks"
              :key="social.label"
              :href="social.href"
              :aria-label="social.label"
              class="flex h-10 w-10 items-center justify-center rounded-full bg-brown-800 text-white transition-all duration-300 hover:bg-gold hover:text-brown-900 hover:shadow-lg"
            >
              <i :class="social.icon" class="text-sm"></i>
            </a>
          </div>
        </div>

        <!-- Map -->
        <div class="fade-in-right overflow-hidden rounded-2xl shadow-lg">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.7985379582!2d107.60867561477257!3d-6.914747795003288!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e652e8f1c1ef%3A0x9e0e74c6d3e6b7a7!2sBandung%2C%20Bandung%20City%2C%20West%20Java!5e0!3m2!1sen!2sid!4v1700000000000!5m2!1sen!2sid"
            width="100%"
            height="420"
            style="border: 0"
            allowfullscreen
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            title="Arletta Cafe location"
          ></iframe>
        </div>
      </div>
    </div>
  </section>
</template>
