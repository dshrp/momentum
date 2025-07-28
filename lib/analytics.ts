// Google Analytics tracking utilities for Momentum
declare global {
  interface Window {
    gtag: (command: string, targetId: string, config?: any) => void
  }
}

export const trackMomentumEvent = {
  // Page views (handled automatically by GA)

  // Event interactions
  viewEvent: (eventId: string) => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "view_event", {
        event_category: "Events",
        event_label: eventId,
        value: 1,
      })
    }
  },

  editEvent: (eventId: string) => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "edit_event", {
        event_category: "Events",
        event_label: eventId,
        value: 1,
      })
    }
  },

  hideEvent: (eventId: string) => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "hide_event", {
        event_category: "Events",
        event_label: eventId,
        value: 1,
      })
    }
  },

  addToCalendar: (eventId: string) => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "add_to_calendar", {
        event_category: "Events",
        event_label: eventId,
        value: 1,
      })
    }
  },

  // User actions
  refreshEvents: () => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "refresh_events", {
        event_category: "User Actions",
        value: 1,
      })
    }
  },

  addSource: (sourceType: string) => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "add_source", {
        event_category: "Sources",
        event_label: sourceType,
        value: 1,
      })
    }
  },

  // Navigation
  visitFollowing: () => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "visit_following", {
        event_category: "Navigation",
        value: 1,
      })
    }
  },

  visitAbout: () => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "visit_about", {
        event_category: "Navigation",
        value: 1,
      })
    }
  },

  // Conversions
  joinWaitlist: (email: string) => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "join_waitlist", {
        event_category: "Conversions",
        value: 1,
      })
    }
  },

  contactSubmit: () => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "contact_submit", {
        event_category: "Conversions",
        value: 1,
      })
    }
  },

  donate: (amount: number) => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "purchase", {
        transaction_id: Date.now().toString(),
        value: amount,
        currency: "USD",
        event_category: "Donations",
      })
    }
  },

  // Errors
  trackError: (error: string, page: string) => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "exception", {
        description: error,
        fatal: false,
        custom_map: { page },
      })
    }
  },
}
