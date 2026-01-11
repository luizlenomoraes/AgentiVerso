import { createClient } from "@supabase/supabase-js"
import Script from "next/script"

// Cliente admin para buscar settings com segurança server-side
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: { persistSession: false }
    }
)

async function getPixelSettings() {
    try {
        console.log("PixelManager: Fetching settings...")
        const { data, error } = await supabaseAdmin
            .from("app_settings")
            .select("*")

        if (error) {
            console.error("PixelManager: Error fetching settings:", error)
            return null
        }

        if (!data || data.length === 0) {
            console.warn("PixelManager: No settings found in app_settings table.")
            return null
        }

        // Transforma array de {key, value} em objeto (suporte a Key-Value Store)
        const settings: any = {}
        data.forEach((row: any) => {
            if (row.key && row.value) {
                settings[row.key] = row.value
            }
            // Se houver colunas legadas ou migradas na primeira linha
            // (Isso cobre o caso híbrido se alguém salvou na coluna)
            if (row.google_pixel_id) settings.google_pixel_id = row.google_pixel_id
            if (row.facebook_pixel_id) settings.facebook_pixel_id = row.facebook_pixel_id
            if (row.tiktok_pixel_id) settings.tiktok_pixel_id = row.tiktok_pixel_id
            if (row.kwai_pixel_id) settings.kwai_pixel_id = row.kwai_pixel_id
            if (row.pinterest_pixel_id) settings.pinterest_pixel_id = row.pinterest_pixel_id
            if (row.taboola_pixel_id) settings.taboola_pixel_id = row.taboola_pixel_id
        })

        console.log("PixelManager: Settings retrieved (KV mapped):", {
            google: settings.google_pixel_id,
            facebook: settings.facebook_pixel_id,
            tiktok: settings.tiktok_pixel_id
        })

        return settings
    } catch (err) {
        console.error("PixelManager: Unexpected error:", err)
        return null
    }
}

export async function PixelManager() {
    const settings: any = await getPixelSettings()

    if (!settings) return null

    return (
        <>
            {/* Google Analytics / Ads */}
            {settings.google_pixel_id && (
                <>
                    <Script
                        src={`https://www.googletagmanager.com/gtag/js?id=${settings.google_pixel_id}`}
                        strategy="afterInteractive"
                    />
                    <Script id="google-analytics" strategy="afterInteractive">
                        {`
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', '${settings.google_pixel_id}');
                        `}
                    </Script>
                </>
            )}

            {/* Meta / Facebook Pixel */}
            {settings.facebook_pixel_id && (
                <Script id="fb-pixel" strategy="afterInteractive">
                    {`
                    !function(f,b,e,v,n,t,s)
                    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                    n.queue=[];t=b.createElement(e);t.async=!0;
                    t.src=v;s=b.getElementsByTagName(e)[0];
                    s.parentNode.insertBefore(t,s)}(window, document,'script',
                    'https://connect.facebook.net/en_US/fbevents.js');
                    fbq('init', '${settings.facebook_pixel_id}');
                    fbq('track', 'PageView');
                    `}
                </Script>
            )}

            {/* TikTok Pixel */}
            {settings.tiktok_pixel_id && (
                <Script id="tiktok-pixel" strategy="afterInteractive">
                    {`
                    !function (w, d, t) {
                    w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
                    ttq.load('${settings.tiktok_pixel_id}');
                    ttq.page();
                    }(window, document, 'ttq');
                    `}
                </Script>
            )}

            {/* Kwai Pixel */}
            {settings.kwai_pixel_id && (
                <Script id="kwai-pixel" strategy="afterInteractive">
                    {`
                    !function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.install=t():e.install=t()}(window,(function(){return function(e){var t={};function n(o){if(t[o])return t[o].exports;var r=t[o]={i:o,l:!1,exports:{}};return e[o].call(r.exports,r,r.exports,n),r.l=!0,r.exports}return n.m=e,n.c=t,n.d=function(e,t,o){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:o})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var o=Object.create(null);if(n.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)n.d(o,r,function(t){return e[t]}.bind(null,r));return o},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=0)}([function(e,t,n){"use strict";var o=this&&this.__spreadArray||function(e,t,n){if(n||2===arguments.length)for(var o=0,r=t.length,a;o<r;o++)!a&&o in t||(a||(a=Array.prototype.slice.call(t,0,o)),a[o]=t[o]);return e.concat(a||Array.prototype.slice.call(t))};!function(e,t,n){var r,a;e.kwaiq=e.kwaiq||[];var i=e.kwaiq;i.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];var c=function(e,t){e[t]=function(){var n=Array.prototype.slice.call(arguments),r=n.shift(),a=o([r,n],i.methods.indexOf(t));e.push(a)}};for(var u=0;u<i.methods.length;u++)c(i,i.methods[u]);i.instance=function(e){var t=i._i[e]||[];return t._i=e,t._u=n,t},i.load=function(e,o){var r="https://s1.kwai.net/kos/s101/nlav11187/pixel/events.js";i._i=i._i||{},i._i[e]=[],i._i[e]._u=r,i._t=i._t||{},i._t[e]=+new Date,i._o=i._o||{},i._o[e]=o||{};var a=t.createElement("script");a.type="text/javascript",a.async=!0,a.src=r+"?sdkid="+e+"&lib=kwaiq";var c=t.getElementsByTagName("script")[0];c.parentNode.insertBefore(a,c)},i.load("${settings.kwai_pixel_id}"),i.page()}(window,document)}]);}));
                    `}
                </Script>
            )}

            {/* Pinterest Tag */}
            {settings.pinterest_pixel_id && (
                <Script id="pinterest-pixel" strategy="afterInteractive">
                    {`
                    !function(e){if(!window.pintrk){window.pintrk = function () {
                    window.pintrk.queue.push(Array.prototype.slice.call(arguments));};var
                      n=window.pintrk;n.queue=[],n.version="3.0";var
                      t=document.createElement("script");t.async=!0,t.src=e;var
                      r=document.getElementsByTagName("script")[0];
                      r.parentNode.insertBefore(t,r)}}("https://s.pinimg.com/ct/core.js");
                    pintrk('load', '${settings.pinterest_pixel_id}');
                    pintrk('page');
                    `}
                </Script>
            )}

            {/* Taboola Pixel */}
            {settings.taboola_pixel_id && (
                <Script id="taboola-pixel" strategy="afterInteractive">
                    {`
                    window._tfa = window._tfa || [];
                    window._tfa.push({notify: 'event', name: 'page_view', id: ${settings.taboola_pixel_id}});
                    !function (t, f, a, x) {
                           if (!document.getElementById(x)) {
                              t.async = 1;t.src = a;t.id=x;f.parentNode.insertBefore(t, f);
                           }
                    }(document.createElement('script'),
                    document.getElementsByTagName('script')[0],
                    '//cdn.taboola.com/libtrc/unip/${settings.taboola_pixel_id}/tfa.js',
                    'tb_tfa_script');
                    `}
                </Script>
            )}
        </>
    )
}
