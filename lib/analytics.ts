// Google Analytics utility functions
declare global {
  interface Window {
    gtag: (command: string, targetId: string, config?: Record<string, any>) => void
  }
}

// Track page views
export const trackPageView = (url: string) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("config", process.env.NEXT_PUBLIC_GA_ID!, {
      page_path: url,
    })
  }
}

// Track custom events
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

// Track specific Momentum events
export const trackMomentumEvent = {
  // User interactions
  viewEvent: (eventId: string) => trackEvent("view_event", "engagement", eventId),
  editEvent: (eventId: string) => trackEvent("edit_event", "engagement", eventId),
  hideEvent: (eventId: string) => trackEvent("hide_event", "engagement", eventId),
  addToCalendar: (eventId: string) => trackEvent("add_to_calendar", "conversion", eventId),

  // Navigation
  visitFollowing: () => trackEvent("visit_following", "navigation"),
  visitAbout: () => trackEvent("visit_about", "navigation"),
  visitAdmin: () => trackEvent("visit_admin", "navigation"),

  // Sources
  addSource: (sourceType: string) => trackEvent("add_source", "sources", sourceType),
  removeSource: (sourceType: string) => trackEvent("remove_source", "sources", sourceType),

  // Donations
  initiateDonation: (amount: number) => trackEvent("initiate_donation", "conversion", "donation", amount),
  completeDonation: (amount: number) => trackEvent("complete_donation", "conversion", "donation", amount),

  // Waitlist
  joinWaitlist: () => trackEvent("join_waitlist", "conversion", "waitlist"),

  // Contact
  submitContact: () => trackEvent("submit_contact", "conversion", "contact"),

  // Refresh actions
  refreshEvents: () => trackEvent("refresh_events", "engagement", "refresh"),
}
