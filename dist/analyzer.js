function getStatusColor(status) {
  switch (status) {
    case "Excellent": return "#22c55e"; // Green
    case "Good": return "#eab308";     // Yellow
    default: return "#ef4444";         // Red ("Needs work" or catch-all)
  }
}

class SEOAnalyzer {
  constructor() {
    this.analysis = null;
  }

  analyzeCurrentPage() {
    const analysis = {
      title: this.getPageTitle(),
      url: this.getPageUrl(),
      metaDescription: this.getMetaDescription(),
      metaRobots: this.getMetaRobots(),
      canonical: this.getCanonicalUrl(),
      openGraph: this.getOpenGraphTags(),
      twitterCard: this.getTwitterCardTags(),
      language: this.getHtmlLang(),
      charset: this.getCharset(),
      mobileFriendly: this.checkMobileViewport(),
      hasFavicon: this.hasFavicon(),
      structuredData: this.hasStructuredData(),
      headings: this.getHeadingsStructure(),
      headingHierarchy: this.getHeadingHierarchyCheck(),
      images: this.getImagesInfo(),
      links: this.getLinkInfo(),
      wordCount: this.getWordCount(),
      seoScore: 0,
      delta:0,
      recommendations: [],
      passSummary: [],
      metaSummary: [],
      timestamp: new Date().toISOString(),
    };

    analysis.seoScore = this.calculateSEOScore(analysis);
    analysis.recommendations = this.generateRecommendations(analysis);
    analysis.passSummary = this.calculatePassSummary(analysis);
    analysis.metaSummary = this.getMetadataSummary(analysis);
    // analysis.delta = this.saveSeoScoreSmart(analysis);
    

    this.analysis = analysis;
    return analysis;
  }

  // --- Detailed field getter methods, each returns rich object ---

  getPageTitle() {
    const title = (document.title || '').trim();
    let passed, status, message;
    if (!title) {
      passed = false; status = "Needs work"; message = "Title is missing.";
    } else if (title.length < 10) {
      passed = false; status = "Needs work"; message = "Title is too short.";
    } else if (title.length > 60) {
      passed = false; status = "Good"; message = "Title is too long.";
    } else {
      passed = true; status = "Excellent"; message = "Title length is optimal.";
    }
    return { key: "title", passed, status, color: getStatusColor(status), message, value: title };
  }

  getPageUrl() {
    const url = window.location.href;
    return {
      key: "url",
      passed: !!url,
      status: !!url ? "Excellent" : "Needs work",
      color: getStatusColor(!!url ? "Excellent" : "Needs work"),
      message: !!url ? "URL is present." : "URL missing.",
      value: url
    };
  }

  getMetaDescription() {
    const value = this.getMetaTagContent('description');
    let passed, status, message;
    if (!value) {
      passed = false; status = "Needs work"; message = "Meta description is missing.";
    } else if (value.length < 50) {
      passed = false; status = "Needs work"; message = "Meta description too short.";
    } else if (value.length > 160) {
      passed = false; status = "Good"; message = "Meta description too long.";
    } else {
      passed = true; status = "Excellent"; message = "Meta description length is optimal.";
    }
    return { key: "metaDescription", passed, status, color: getStatusColor(status), message, value };
  }

  getMetaTagContent(name) {
    const tag = document.querySelector(`meta[name="${name}"]`);
    return tag?.content?.trim() || '';
  }

  getMetaRobots() {
    const value = this.getMetaTagContent('robots');
    let passed, status, message;
    if (!value) {
      passed = true; status = "Excellent"; message = "No robots meta tag found; default is index, follow.";
    } else if (typeof value === "string" && value.toLowerCase().includes("noindex")) {
      passed = false; status = "Needs work"; message = "Page is marked noindex (won't be indexed).";
    } else {
      passed = true; status = "Excellent"; message = "Page is indexable.";
    }
    return { key: "metaRobots", passed, status, color: getStatusColor(status), message, value };
  }

  getCanonicalUrl() {
    const value = (document.querySelector('link[rel="canonical"]')?.href || '').trim();
    const passed = !!value;
    const status = passed ? "Excellent" : "Needs work";
    const message = passed ? "Canonical URL is set." : "Canonical URL is missing.";
    return { key: "canonical", passed, status, color: getStatusColor(status), message, value };
  }

  getOpenGraphTags() {
    const tags = {};
    document.querySelectorAll('meta[property^="og:"]').forEach(meta => {
      tags[meta.getAttribute('property')] = meta.getAttribute('content') || '';
    });
    const passed = Object.keys(tags).length > 0;
    const status = passed ? "Excellent" : "Good";
    const message = passed ? "Open Graph tags present." : "No Open Graph tags.";
    return { key: "openGraph", passed, status, color: getStatusColor(status), message, value: tags };
  }

  getTwitterCardTags() {
    const tags = {};
    document.querySelectorAll('meta[name^="twitter:"]').forEach(meta => {
      tags[meta.getAttribute('name')] = meta.getAttribute('content') || '';
    });
    const passed = Object.keys(tags).length > 0;
    const status = passed ? "Excellent" : "Good";
    const message = passed ? "Twitter Card tags present." : "No Twitter Card tags.";
    return { key: "twitterCard", passed, status, color: getStatusColor(status), message, value: tags };
  }

  getHtmlLang() {
    const value = document.documentElement.lang || '';
    const passed = !!value;
    const status = passed ? "Excellent" : "Needs work";
    const message = passed ? "HTML lang attribute present." : "HTML lang attribute missing.";
    return { key: "language", passed, status, color: getStatusColor(status), message, value };
  }

  getCharset() {
    const value = (document.querySelector('meta[charset]')?.getAttribute('charset') || '').trim();
    const passed = value.toLowerCase() === 'utf-8';
    const status = passed ? "Excellent" : "Needs work";
    const message = passed ? "Charset is UTF-8." : (value ? "Charset is not UTF-8." : "Charset missing.");
    return { key: "charset", passed, status, color: getStatusColor(status), message, value };
  }

  checkMobileViewport() {
    const value = document.querySelector('meta[name="viewport"]')?.content || '';
    const passed = value.includes('width=device-width');
    const status = passed ? "Excellent" : "Needs work";
    const message = passed ? "Mobile viewport set." : "No mobile viewport meta tag.";
    return { key: "mobileFriendly", passed, status, color: getStatusColor(status), message, value };
  }

  hasFavicon() {
    const links = document.querySelectorAll('link[rel*="icon"]');
    const passed = links.length > 0;
    const status = passed ? "Excellent" : "Needs work";
    const message = passed ? "Favicon is present." : "Favicon missing.";
    return { key: "hasFavicon", passed, status, color: getStatusColor(status), message, value: passed };
  }

  hasStructuredData() {
    const structuredData = [];

    // 1. ✅ JSON-LD with @graph support
    const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
    jsonLdScripts.forEach(script => {
      try {
        const parsed = JSON.parse(script.textContent.trim());

        if (Array.isArray(parsed)) {
          // Array of objects
          parsed.forEach(item => structuredData.push({ type: "json-ld", data: item }));
        } else if (parsed["@graph"]) {
          // Flatten each entity inside the graph
          parsed["@graph"].forEach(item => structuredData.push({ type: "json-ld", data: item }));
        } else {
          // Single root object
          structuredData.push({ type: "json-ld", data: parsed });
        }
      } catch (e) {
        // console.warn("❌ Invalid JSON-LD:", e);
      }
    });

    // 2. ✅ Microdata
    const microdataItems = document.querySelectorAll('[itemscope]');
    microdataItems.forEach(item => {
      const itemData = {};
      const itemtype = item.getAttribute('itemtype');
      if (itemtype) itemData["@type"] = itemtype;

      const props = item.querySelectorAll('[itemprop]');
      props.forEach(prop => {
        const name = prop.getAttribute('itemprop');
        let value;

        if (prop.hasAttribute('content')) {
          value = prop.getAttribute('content');
        } else if (prop.tagName === 'META') {
          value = prop.getAttribute('content');
        } else if (prop.tagName === 'IMG') {
          value = prop.getAttribute('src');
        } else {
          value = prop.textContent.trim();
        }

        itemData[name] = value;
      });

      structuredData.push({ type: "microdata", data: itemData });
    });

    // 3. ✅ RDFa
    const rdfaElements = document.querySelectorAll('[typeof]');
    rdfaElements.forEach(el => {
      const rdfaData = { "@type": el.getAttribute("typeof") };
      const properties = el.querySelectorAll('[property]');
      properties.forEach(prop => {
        const name = prop.getAttribute('property');
        const value = prop.getAttribute('content') || prop.textContent.trim();
        rdfaData[name] = value;
      });
      structuredData.push({ type: "rdfa", data: rdfaData });
    });

    return {
      key: "structuredData",
      count: structuredData.length,
      passed: structuredData.length > 0,
      status: structuredData.length > 0 ? "Excellent" : "Good",
      color: getStatusColor(structuredData.length > 0 ? "Excellent" : "Good"),
      message: structuredData.length > 0
        ? `Found ${structuredData.length} structured data block${structuredData.length > 1 ? "s" : ""}.`
        : "No structured data found.",
      data: structuredData
    };
  }



  getHeadingsStructure() {
    const h1 = document.querySelectorAll('h1').length;
    const h2 = document.querySelectorAll('h2').length;
    // h1 scoring (must have exactly one)
    let h1Passed, h1Status, h1Message;
    if (h1 === 0) {
      h1Passed = false; h1Status = "Needs work"; h1Message = "No H1 heading found.";
    } else if (h1 > 1) {
      h1Passed = false; h1Status = "Good"; h1Message = "Multiple H1 headings found.";
    } else {
      h1Passed = true; h1Status = "Excellent"; h1Message = "Exactly one H1 heading.";
    }
    // h2 scoring (must have at least one)
    let h2Passed = h2 >= 1, h2Status = h2Passed ? "Excellent" : "Needs work", h2Message = h2Passed ? "At least one H2 heading." : "No H2 headings found.";
    return {
      key: "headings",
      value: { h1, h2, h3: document.querySelectorAll('h3').length, h4: document.querySelectorAll('h4').length, h5: document.querySelectorAll('h5').length, h6: document.querySelectorAll('h6').length },
      h1: { passed: h1Passed, status: h1Status, color: getStatusColor(h1Status), message: h1Message, value: h1 },
      h2: { passed: h2Passed, status: h2Status, color: getStatusColor(h2Status), message: h2Message, value: h2 }
    };
  }

  getImagesInfo() {
    const images = document.querySelectorAll('img');
    let missingAlt = 0;
    images.forEach(img => { if (!img.alt || img.alt.trim() === '') missingAlt++; });
    let passed, status, message;
    if (images.length === 0) {
      passed = false; status = "Good"; message = "No images found.";
    } else if (missingAlt > 0) {
      passed = false; status = "Needs work"; message = `${missingAlt} images missing alt text.`;
    } else {
      passed = true; status = "Excellent"; message = "All images have alt text.";
    }
    return { key: "images", passed, status, color: getStatusColor(status), message, value: { total: images.length, missingAlt } };
  }

  getHeadingHierarchy() {
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(node => ({
      tag: node.tagName,
      level: parseInt(node.tagName.substring(1), 10),
      text: (node.textContent || '').trim()
    }));
    return headings;
  }

  getHeadingHierarchyCheck() {
    const headingOrder = this.getHeadingHierarchy();
    let passed = true;
    let status = "Excellent";
    let message = "Heading hierarchy is valid.";

    if (headingOrder.length === 0) {
      return {
        key: "headingHierarchy",
        passed: false,
        status: "Needs work",
        color: getStatusColor("Needs work"),
        message: "No headings found on the page.",
        value: headingOrder
      };
    }

    const firstHeading = headingOrder[0];

    // 1. Must start with H1
    if (firstHeading.level !== 1) {
      passed = false;
      status = "Needs work";
      message = "The first heading is not an H1. Always start with a single H1.";
    }

    // 2. Ensure only one H1 exists
    const h1Count = headingOrder.filter(h => h.level === 1).length;
    if (h1Count > 1) {
      passed = false;
      status = "Good";
      message = `Multiple H1 tags found (${h1Count}). Use a single H1 for the main title.`;
    }

    // 3. Check for skipped heading levels (e.g., H2 -> H4)
    for (let i = 1; i < headingOrder.length; i++) {
      const prev = headingOrder[i - 1];
      const curr = headingOrder[i];
      if (curr.level > prev.level + 1) {
        passed = false;
        status = "Good";
        message = `Heading level jumped from H${prev.level} to H${curr.level}. Avoid skipping levels.`;
        break;
      }
    }

    return {
      key: "headingHierarchy",
      passed,
      status,
      color: getStatusColor(status),
      message,
      value: headingOrder
    };
  }




  getLinkInfo() {
    const links = Array.from(document.querySelectorAll('a'));
    let inactiveLinks = [];
    let totalLinks = links.length;

    const isInactive = (href) =>
      !href || href.trim() === '' || href === '#' || href.startsWith('javascript');

    links.forEach(link => {
      const href = link.getAttribute('href');
      if (isInactive(href)) {
        inactiveLinks.push({
          text: (link.textContent || '').trim(),
          href: href,
        });
      }
    });

    let passed = true;
    let status = "Excellent";
    let message = "All links appear to be active and useful.";

    if (totalLinks === 0) {
      passed = false;
      status = "Needs work";
      message = "No links found. Consider adding relevant internal and external links.";
    } else if (inactiveLinks.length > 0) {
      passed = false;
      status = "Needs work";
      message = `${inactiveLinks.length} inactive or placeholder link(s) detected.`;
    }

    return {
      key: "links",
      passed,
      status,
      color: getStatusColor(status),
      message,
      value: {
        totalLinks,
        activeLinks: totalLinks - inactiveLinks.length,
        inactiveLinksCount: inactiveLinks.length,
        inactiveLinks,
      },
    };
  }


  getWordCount() {
    const text = document.body.innerText || '';
    const value = text.split(/\s+/).filter(word => word.length > 0).length;
    let passed, status, message;
    if (value < 150) {
      passed = false; status = "Needs work"; message = "Not enough content.";
    } else if (value < 300) {
      passed = false; status = "Good"; message = "Content a bit short.";
    } else {
      passed = true; status = "Excellent"; message = "Good content length.";
    }
    return { key: "wordCount", passed, status, color: getStatusColor(status), message, value };
  }

  // --- Scoring method, robust and strict (100 max when perfect SEO)

  calculateSEOScore(data) {
    let score = 0;

    // Title and meta description
    if (data.title?.passed) score += 10;
    if (data.metaDescription?.passed) score += 10;

    // Robots
    if (data.metaRobots?.passed) score += 5;

    // Headings: H1 must be exactly one, H2 must be at least one
    if (data.headings?.h1?.passed) score += 5;
    if (data.headings?.h2?.passed) score += 5;

    if (data.headingHierarchy.passed) score += 10;

    // Content length
    if (data.wordCount?.passed) score += 10;

    // Images
    if (data.images?.passed) score += 5;

    // Links
    if (data.links?.passed) score += 5;

    // Canonical
    if (data.canonical?.passed) score += 5;

    // Open Graph
    if (data.openGraph?.passed) score += 5;

    // Mobile-friendly
    if (data.mobileFriendly?.passed) score += 5;

    // Favicon
    if (data.hasFavicon?.passed) score += 5;

    // Structured Data
    if (data.structuredData?.passed) score += 5;

    // Language
    if (data.language?.passed) score += 5;

    // Charset
    if (data.charset?.passed) score += 5;

    // Cap at 100
    return Math.min(score, 100);
  }

  // --- Recommendations, now compatible with returned objects

  generateRecommendations(data) {
    const recs = [];

    // Title
    if (!data.title.value) recs.push('Add a page title');
    else if (data.title.value.length > 60) recs.push('Title too long');
    else if (data.title.value.length < 10) recs.push('Title too short');

    // Meta Description
    if (!data.metaDescription.value) recs.push('Add a meta description');
    else if (data.metaDescription.value.length < 50) recs.push('Meta description too short');
    else if (data.metaDescription.value.length > 160) recs.push('Meta description too long');

    // Robots
    if (data.metaRobots?.value?.toLowerCase().includes('noindex')) recs.push('Page is marked noindex');

    // Headings
    if (data.headings.value.h1 === 0) recs.push('Add one H1 heading');
    if (data.headings.value.h1 > 1) recs.push('Only use one H1 per page');
    if (data.headings.value.h2 === 0) recs.push('Add at least one H2 heading');

    // Content Length
    if (data.wordCount.value < 150) recs.push('Add more content');

    // Heading Hirachy
    // Heading hierarchy structure check (if present)
    if (data.headingHierarchy && !data.headingHierarchy.passed) {
      recs.push(data.headingHierarchy.message);
    }

    // Images
    if (data.images.value.total === 0) recs.push('Add images');
    if (data.images.value.missingAlt > 0) recs.push(`${data.images.value.missingAlt} images missing alt text`);

    // Links
    if (data.links.value.total === 0) recs.push('Add links');
    if (data.links.value.inactive > 0) recs.push(`${data.links.value.inactive} inactive links`);

    // Canonical
    if (!data.canonical.value) recs.push('Add a canonical link');

    // Open Graph
    if (!data.openGraph.passed) recs.push('Add Open Graph meta tags');

    // Mobile
    if (!data.mobileFriendly.passed) recs.push('Add mobile viewport meta tag');

    // Favicon
    if (!data.hasFavicon.passed) recs.push('Add a favicon');

    // Structured Data
    if (!data.structuredData.passed) recs.push('Add structured data (JSON-LD)');

    // Language
    if (!data.language.value) recs.push('Declare HTML language');

    // Charset
    if (typeof data.charset.value !== "string" || data.charset.value.toLowerCase() !== 'utf-8') recs.push('Use UTF-8 charset');

    return recs;
  }

  getScoreColor(score) {
    if (score >= 80) return '#10b981'; // green
    if (score >= 60) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  }

  getScoreTextColor(score) {
    if (score >= 80) return '#059669';
    if (score >= 60) return '#d97706';
    return '#dc2626';
  }

  getScoreLabel(score) {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  }

  formatAnalysisForDisplay(analysis) {
    return {
      ...analysis,
      scoreColor: this.getScoreColor(analysis.seoScore),
      scoreTextColor: this.getScoreTextColor(analysis.seoScore),
      scoreLabel: this.getScoreLabel(analysis.seoScore)
    };
  }

  getLatestAnalysis() {
    return this.analysis;
  }

  clearAnalysis() {
    this.analysis = null;
  }

  getMetadataSummary(data) {
    const ok = [data.title?.passed, data.metaDescription?.passed, data.canonical?.passed].filter(Boolean).length;
    const total = 3;
    const status = ok === 3 ? "Excellent" : ok >= 2 ? "Good" : "Needs work";
    return { key: "metadata", passed: ok >= 2, status, color: getStatusColor(status), value: { ok, total } };
  }

  calculatePassSummary(data) {
    const checks = {
      title: data.title?.passed,
      metaDescription: data.metaDescription?.passed,
      metaRobots: data.metaRobots?.passed,
      h1: data.headings?.h1?.passed,
      h2: data.headings?.h2?.passed,
      headingHierarchy: data.headingHierarchy?.passed,
      wordCount: data.wordCount?.passed,
      images: data.images?.passed,
      links: data.links?.passed,
      canonical: data.canonical?.passed,
      openGraph: data.openGraph?.passed,
      mobileFriendly: data.mobileFriendly?.passed,
      hasFavicon: data.hasFavicon?.passed,
      structuredData: data.structuredData?.passed,
      language: data.language?.passed,
      charset: data.charset?.passed,
    };

    const entries = Object.entries(checks).filter(([, v]) => typeof v === "boolean");
    const totalChecks = entries.length;
    const passed = entries.reduce((n, [, v]) => n + (v ? 1 : 0), 0);
    const passPercent = totalChecks ? Math.round((passed / totalChecks) * 100) : 0;
    const pagewordCount = data.wordCount.value;

    return {
      passed,                          // number passed
      totalChecks,                     // total counted
      passedOutOf: `${passed}/${totalChecks}`,
      passPercent,                     // 0..100
      checks: Object.fromEntries(entries), // per-check booleans
      pagewordCount: pagewordCount
    };
  }
 

saveSeoScoreSmart(data) {
  const url = data.url;
  const normalizeUrl = true;
  const newScore = data.seoScore;
  const now = Date.now();
  const maxAgeMs = 30 * 24 * 60 * 60 * 1000; // 30 days

  if (typeof newScore !== "number" || isNaN(newScore) || newScore < 0 || newScore > 100) {
    console.warn("Invalid SEO score provided.");
    return 0;
  }

  const targetUrl = normalizeUrl ? this.normalizePageUrl(url) : url;
  const storageKey = `seo-score:${targetUrl}`;

  const prevData = localStorage.getItem(storageKey);
  let previousScore;

  if (prevData) {
    try {
      const { score, timestamp } = JSON.parse(prevData);
      if (now - timestamp <= maxAgeMs) {
        previousScore = score;
      } else {
        localStorage.removeItem(storageKey); // Expired
      }
    } catch {
      localStorage.removeItem(storageKey); // Corrupted data
    }
  }

  if (previousScore === newScore) {
    return 0;
  }

  localStorage.setItem(storageKey, JSON.stringify({
    score: newScore,
    timestamp: now
  }));

  return previousScore !== undefined ? newScore - previousScore : 0;
}

normalizePageUrl(rawUrl) {
  try {
    const u = new URL(rawUrl);
    u.search = "";
    u.hash = "";
    return u.toString();
  } catch {
    return rawUrl;
  }
}

}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SEOAnalyzer;
} else {
  window.SEOAnalyzer = SEOAnalyzer;
}
