import { useEffect, useMemo, useRef, useState } from "react";

type IconName =
  | "accessibility"
  | "arrow"
  | "car"
  | "chevron"
  | "clock"
  | "ev"
  | "filter"
  | "location"
  | "menu"
  | "search"
  | "sparkles"
  | "user"
  | "walk"
  | "women"
  | "x";

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    accessibility: <><circle cx="10" cy="4" r="2" /><path d="M10 7v6h5l3 5M7 9h5M9 13a5 5 0 1 0 5 6" /></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    car: <><path d="M5 17h14v-5l-2-5H7l-2 5v5Z" /><path d="M7 17v2m10-2v2M5 12h14M8 14h.01M16 14h.01" /></>,
    chevron: <path d="m8 10 4 4 4-4" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    ev: <><path d="M7 3v9a4 4 0 0 0 8 0V8" /><path d="M15 8h3v4a2 2 0 0 0 2 2M5 6h4M5 9h4" /></>,
    filter: <><path d="M4 7h16M7 12h10M10 17h4" /><circle cx="8" cy="7" r="1.5" fill="currentColor" /><circle cx="15" cy="12" r="1.5" fill="currentColor" /><circle cx="12" cy="17" r="1.5" fill="currentColor" /></>,
    location: <><circle cx="12" cy="12" r="3" /><circle cx="12" cy="12" r="8" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2" /></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m16 16 4 4" /></>,
    sparkles: <><path d="m12 3 1.1 3.1L16 7.5l-2.9 1.4L12 12l-1.1-3.1L8 7.5l2.9-1.4L12 3ZM6 13l.8 2.2L9 16l-2.2.8L6 19l-.8-2.2L3 16l2.2-.8L6 13Z" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4.5 21a7.5 7.5 0 0 1 15 0" /></>,
    walk: <><circle cx="13" cy="5" r="2" /><path d="m9 21 2-6-2-3 2-4 4 3 3 1M11 15l4 2 2 4" /></>,
    women: <><circle cx="12" cy="5" r="2.5" /><path d="M9.5 9h5l2.5 7h-3l-.5 5m-3 0-.5-5H7l2.5-7Z" /></>,
    x: <><path d="m6 6 12 12M18 6 6 18" /></>,
  };

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

const garages = [
  { id: 1, name: "Harbor Center", address: "18 Market Street", available: 48, evAvailable: 8, evTotal: 12, womenAvailable: 6, womenTotal: 10, accessibleSpaces: 5, total: 120, price: "$3.50", dayPrice: "$24", hours: "06:00–00:00", open: true, walk: "2 min", x: 63, y: 28, tag: "Best match" },
  { id: 2, name: "Civic Square", address: "240 King Avenue", available: 12, evAvailable: 2, evTotal: 8, womenAvailable: 3, womenTotal: 8, accessibleSpaces: 2, total: 86, price: "$4.00", dayPrice: "$28", hours: "07:00–23:00", open: true, walk: "5 min", x: 29, y: 42, tag: "Covered" },
  { id: 3, name: "Central Station", address: "5 Union Plaza", available: 6, evAvailable: 0, evTotal: 10, womenAvailable: 0, womenTotal: 12, accessibleSpaces: 0, total: 150, price: "$2.80", dayPrice: "$20", hours: "Open 24 hours", open: true, walk: "7 min", x: 72, y: 58, tag: "Open 24/7" },
  { id: 4, name: "Riverside Garage", address: "81 Water Lane", available: 27, evAvailable: 5, evTotal: 6, womenAvailable: 4, womenTotal: 6, accessibleSpaces: 3, total: 64, price: "$3.20", dayPrice: "$22", hours: "08:00–22:00", open: true, walk: "9 min", x: 21, y: 68, tag: "Fast charging" },
];

type MapPoint = { x: number; y: number };

const routePaths: Record<number, MapPoint[]> = {
  1: [{ x: 51, y: 48 }, { x: 65, y: 49 }, { x: 65, y: 31 }, { x: 63, y: 28 }],
  2: [{ x: 51, y: 48 }, { x: 31, y: 49 }, { x: 31, y: 42 }, { x: 29, y: 42 }],
  3: [{ x: 51, y: 48 }, { x: 65, y: 49 }, { x: 65, y: 58 }, { x: 72, y: 58 }],
  4: [{ x: 51, y: 48 }, { x: 31, y: 49 }, { x: 31, y: 69 }, { x: 21, y: 68 }],
};

function pointAlongRoute(points: MapPoint[], progress: number) {
  const segments = points.slice(1).map((point, index) => ({
    from: points[index],
    to: point,
    length: Math.hypot(point.x - points[index].x, point.y - points[index].y),
  }));
  const totalLength = segments.reduce((sum, segment) => sum + segment.length, 0);
  let remaining = progress * totalLength;

  for (const segment of segments) {
    if (remaining <= segment.length) {
      const segmentProgress = segment.length === 0 ? 0 : remaining / segment.length;
      return {
        x: segment.from.x + (segment.to.x - segment.from.x) * segmentProgress,
        y: segment.from.y + (segment.to.y - segment.from.y) * segmentProgress,
        remainingDistance: totalLength * (1 - progress),
      };
    }
    remaining -= segment.length;
  }

  return { ...points[points.length - 1], remainingDistance: 0 };
}

function availabilityColor(available: number) {
  if (available < 10) return "low";
  if (available < 20) return "medium";
  return "high";
}

type LoginProvider = "Username and password" | "Google" | "LinkedIn" | "Apple";
type ParkingPreference = "standard" | "ev" | "women" | "accessible";

export default function App() {
  const [selectedId, setSelectedId] = useState(1);
  const [query, setQuery] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [evOnly, setEvOnly] = useState(false);
  const [womenOnly, setWomenOnly] = useState(false);
  const [accessibleOnly, setAccessibleOnly] = useState(false);
  const [loginOpen, setLoginOpen] = useState(true);
  const [signedInWith, setSignedInWith] = useState<LoginProvider | null>(null);
  const [loginPreference, setLoginPreference] = useState<ParkingPreference>("standard");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [bookingMessage, setBookingMessage] = useState("");
  const [navigationStarted, setNavigationStarted] = useState(false);
  const [hasArrived, setHasArrived] = useState(false);
  const [routeProgress, setRouteProgress] = useState(0);
  const [nearTarget, setNearTarget] = useState(false);
  const notificationTimer = useRef<number | null>(null);
  const selected = garages.find((garage) => garage.id === selectedId) ?? garages[0];
  const loyaltyProgress = loyaltyPoints % 5;
  const freeParkingHours = Math.floor(loyaltyPoints / 5);
  const activeRoute = routePaths[selected.id];
  const gpsPosition = pointAlongRoute(activeRoute, routeProgress);
  const distanceToTarget = Math.round(gpsPosition.remainingDistance * 18);

  useEffect(() => {
    if (!navigationStarted || hasArrived || nearTarget) return;
    const movementTimer = window.setInterval(() => {
      setRouteProgress((current) => Math.min(current + 0.02, 1));
    }, 120);
    return () => window.clearInterval(movementTimer);
  }, [navigationStarted, hasArrived, nearTarget]);

  useEffect(() => {
    if (navigationStarted && !nearTarget && distanceToTarget < 50) {
      setNearTarget(true);
      showNotification(`You’re within 50 m of ${selected.name}. Confirm when you’ve arrived.`);
    }
  }, [distanceToTarget, navigationStarted, nearTarget, selected.name]);

  const visibleGarages = useMemo(
    () =>
      garages.filter(
        (garage) =>
          (!onlyAvailable || garage.available >= 20) &&
          (!evOnly || garage.evAvailable > 0) &&
          (!womenOnly || garage.womenAvailable > 0) &&
          (!accessibleOnly || garage.accessibleSpaces > 0) &&
          `${garage.name} ${garage.address}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [query, onlyAvailable, evOnly, womenOnly, accessibleOnly],
  );

  function chooseGarage(id: number) {
    setSelectedId(id);
    setSheetOpen(true);
    setNavigationStarted(false);
    setHasArrived(false);
    setRouteProgress(0);
    setNearTarget(false);
  }

  function openLogin() {
    setLoginPreference(evOnly ? "ev" : womenOnly ? "women" : accessibleOnly ? "accessible" : "standard");
    setLoginOpen(true);
  }

  function applyParkingPreferences() {
    setEvOnly(loginPreference === "ev");
    setWomenOnly(loginPreference === "women");
    setAccessibleOnly(loginPreference === "accessible");
  }

  function loginWith(provider: LoginProvider) {
    setLoginError("");
    setSignedInWith(provider);
    applyParkingPreferences();
    setLoginOpen(false);
  }

  function loginWithPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!username.trim() || !password) {
      setLoginError("Enter both your username and password.");
      return;
    }
    loginWith("Username and password");
  }

  function saveProfile() {
    applyParkingPreferences();
    setLoginOpen(false);
  }

  function signOut() {
    setSignedInWith(null);
    setLoginOpen(true);
  }

  function showNotification(message: string) {
    setBookingMessage(message);
    if (notificationTimer.current) window.clearTimeout(notificationTimer.current);
    notificationTimer.current = window.setTimeout(() => setBookingMessage(""), 7000);
  }

  function bookParking() {
    const nextPoints = loyaltyPoints + 1;
    setLoyaltyPoints(nextPoints);
    showNotification(
      nextPoints % 5 === 0
        ? `Booking confirmed at ${selected.name}. You unlocked 1 hour of free parking!`
        : `Booking confirmed at ${selected.name}. ${5 - (nextPoints % 5)} more ${5 - (nextPoints % 5) === 1 ? "booking" : "bookings"} until your free hour.`,
    );
    setNavigationStarted(false);
    setHasArrived(false);
    setRouteProgress(0);
    setNearTarget(false);
  }

  function startNavigation() {
    setNavigationStarted(true);
    setHasArrived(false);
    setNearTarget(false);
    setRouteProgress(0);
    showNotification(`Navigation started to ${selected.name}. Follow the moving car on the map.`);
  }

  function confirmArrival() {
    setRouteProgress(1);
    setHasArrived(true);
    showNotification(`Arrival confirmed at ${selected.name}. You can now book your parking.`);
  }

  return (
    <main className="app-shell">
      <section className="phone-frame" aria-label="Nearby parking map">
        <div className="map">
          <div className="water" />
          <div className="park park-one"><span>RIVERSIDE PARK</span></div>
          <div className="park park-two" />
          <div className="building b1" /><div className="building b2" /><div className="building b3" />
          <div className="building b4" /><div className="building b5" /><div className="building b6" />
          <div className="building b7" /><div className="building b8" /><div className="building b9" />
          <div className="road horizontal r1" /><div className="road horizontal r2" /><div className="road horizontal r3" />
          <div className="road vertical r4" /><div className="road vertical r5" /><div className="road diagonal r6" />
          <span className="street s1">MARKET STREET</span>
          <span className="street s2">KING AVENUE</span>
          <span className="street s3">WATER LANE</span>
          <span className="place-label station">CENTRAL<br />STATION</span>
          <span className="place-label museum">CITY<br />MUSEUM</span>

          {visibleGarages.map((garage) => (
            <button
              className={`parking-pin ${availabilityColor(garage.available)} ${selectedId === garage.id ? "selected" : ""}`}
              key={garage.id}
              style={{ left: `${garage.x}%`, top: `${garage.y}%` }}
              onClick={() => chooseGarage(garage.id)}
              aria-label={`${garage.name}, ${garage.available} spaces available`}
            >
              <span className="pin-icon">P</span>
              <span className="pin-count">{garage.available}</span>
              {garage.evAvailable > 0 && <span className="pin-ev"><Icon name="ev" size={10} />{garage.evAvailable}</span>}
              <span className="pin-price">{garage.price}/hr</span>
              <span className="pin-tail" />
            </button>
          ))}

          {navigationStarted && (
            <>
              <svg className="route-line" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                <polyline points={activeRoute.map((point) => `${point.x},${point.y}`).join(" ")} />
              </svg>
              <div
                className={`moving-car ${nearTarget ? "near-target" : ""}`}
                style={{ left: `${gpsPosition.x}%`, top: `${gpsPosition.y}%` }}
                aria-label={`Current position, ${distanceToTarget} meters from ${selected.name}`}
              >
                <span><Icon name="car" size={16} /></span>
                <small>{distanceToTarget < 50 ? "<50 m" : `${distanceToTarget} m`}</small>
              </div>
            </>
          )}

          <div className={`you-are-here ${navigationStarted ? "navigating" : ""}`} aria-label="Your location">
            <span className="pulse" />
            <span className="blue-dot" />
          </div>

          <header className="top-controls">
            <div className="brand-row">
              <button className="round-button menu-button" aria-label="Open menu"><Icon name="menu" /></button>
              <div className="wordmark"><span>Park</span> <strong>Pulse</strong></div>
              <button className={`avatar ${signedInWith ? "signed-in" : ""}`} aria-label={signedInWith ? "Open profile" : "Sign in"} onClick={openLogin}>
                {signedInWith ? "DU" : <Icon name="user" size={19} />}
              </button>
            </div>
            <label className="search-box">
              <Icon name="search" size={19} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search a place or address"
                aria-label="Search a place or address"
              />
              {query && <button onClick={() => setQuery("")} aria-label="Clear search"><Icon name="x" size={17} /></button>}
            </label>
            <div className="filter-row">
              <button className={`filter-pill ev-filter ${evOnly ? "active" : ""}`} onClick={() => setEvOnly(!evOnly)}>
                <Icon name="ev" size={16} /> EV available
              </button>
              <button className={`filter-pill women-filter ${womenOnly ? "active" : ""}`} onClick={() => setWomenOnly(!womenOnly)}>
                <Icon name="women" size={16} /> Women’s parking
              </button>
              <button className={`filter-pill ${accessibleOnly ? "active" : ""}`} onClick={() => setAccessibleOnly(!accessibleOnly)}>
                <Icon name="accessibility" size={16} /> Wheelchair access
              </button>
              <button className={`filter-pill ${onlyAvailable ? "active" : ""}`} onClick={() => setOnlyAvailable(!onlyAvailable)}>
                <Icon name="filter" size={16} /> 20+ spaces
              </button>
              <button className="filter-pill">Price <Icon name="chevron" size={15} /></button>
              <button className="filter-pill">Distance <Icon name="chevron" size={15} /></button>
            </div>
          </header>

          {visibleGarages.length === 0 && (
            <div className="no-results">
              <Icon name="search" />
              <span>No garages match your search</span>
            </div>
          )}

          <div className="map-tools">
            <button className="round-button" aria-label="Center on my location"><Icon name="location" /></button>
          </div>
        </div>

        <section className={`bottom-sheet ${sheetOpen ? "open" : ""}`}>
          <button className="sheet-handle-area" onClick={() => setSheetOpen(!sheetOpen)} aria-label={sheetOpen ? "Collapse details" : "Expand details"}>
            <span className="sheet-handle" />
          </button>
          <div className="sheet-heading">
            <div>
              <p className="eyebrow"><span className="live-dot" /> LIVE AVAILABILITY</p>
              <h1>{selected.name}</h1>
              <p className="address">{selected.address}</p>
            </div>
            <div className={`availability-badge ${availabilityColor(selected.available)}`}>
              <strong>{selected.available}</strong>
              <span>spaces</span>
            </div>
          </div>

          <div className="quick-stats">
            <div><Icon name="walk" /><span><strong>{selected.walk}</strong> walk</span></div>
            <div><span className="currency-icon">$</span><span><strong>{selected.price}</strong>/hr</span></div>
            <div className="ev-stat"><Icon name="ev" /><span><strong>{selected.evAvailable}</strong> EV free</span></div>
            <div className="women-stat"><Icon name="women" /><span><strong>{selected.womenAvailable}</strong> women’s</span></div>
          </div>

          {sheetOpen && (
            <div className="expanded-content">
              <div className="occupancy-label"><span>Current occupancy</span><strong>{Math.round(((selected.total - selected.available) / selected.total) * 100)}% full</strong></div>
              <div className="occupancy-track"><span style={{ width: `${((selected.total - selected.available) / selected.total) * 100}%` }} /></div>
              <div className="special-availability-grid">
                <div className="special-availability ev-availability">
                  <span className="special-availability-icon"><Icon name="ev" size={18} /></span>
                  <div><strong>{selected.evAvailable} EV spaces</strong><span>{selected.evTotal} charging bays total</span></div>
                  <span className={selected.evAvailable > 0 ? "space-open" : "space-full"}>{selected.evAvailable > 0 ? "Available" : "Full"}</span>
                </div>
                <div className="special-availability women-availability">
                  <span className="special-availability-icon"><Icon name="women" size={18} /></span>
                  <div><strong>{selected.womenAvailable} women’s spaces</strong><span>{selected.womenTotal} designated spaces total</span></div>
                  <span className={selected.womenAvailable > 0 ? "space-open" : "space-full"}>{selected.womenAvailable > 0 ? "Available" : "Full"}</span>
                </div>
              </div>
              <div className="info-grid">
                <div className="info-card">
                  <span className="info-card-icon currency-icon">$</span>
                  <div><span>Parking prices</span><strong>{selected.price}/hour · {selected.dayPrice}/day</strong></div>
                </div>
                <div className="info-card">
                  <span className="info-card-icon"><Icon name="clock" size={16} /></span>
                  <div><span>Working hours</span><strong>{selected.hours}</strong></div>
                  <span className={`open-status ${selected.open ? "" : "closed"}`}>{selected.open ? "Open" : "Closed"}</span>
                </div>
              </div>
              <div className="feature-row"><Icon name="sparkles" size={17} /> {selected.tag} · Height limit 2.1m</div>
            </div>
          )}

          <div className="loyalty-mini">
            <span><Icon name="sparkles" size={14} /> Park Pulse Rewards</span>
            <strong>{loyaltyProgress}/5 bookings</strong>
          </div>
          {hasArrived ? (
            <button className="primary-button" onClick={bookParking}>
              <span>Book parking</span><Icon name="arrow" />
            </button>
          ) : (
            <button className={`primary-button ${navigationStarted ? "navigation-active" : ""}`} disabled={navigationStarted} onClick={startNavigation}>
              <span>{navigationStarted ? "Navigation in progress" : "Navigate to parking"}</span><Icon name="arrow" />
            </button>
          )}
          {navigationStarted && nearTarget && !hasArrived && (
            <button className="arrival-button" onClick={confirmArrival}>
              I’ve arrived at the parking garage
            </button>
          )}
          <p className="updated">Updated just now</p>
        </section>

        {loginOpen && (
          <div className="login-overlay" role="presentation" onMouseDown={() => signedInWith && setLoginOpen(false)}>
            <section className="login-dialog" role="dialog" aria-modal="true" aria-labelledby="login-title" onMouseDown={(event) => event.stopPropagation()}>
              {signedInWith && (
                <button className="login-close" aria-label="Close profile" onClick={() => setLoginOpen(false)}><Icon name="x" size={18} /></button>
              )}

              <div className="login-brand">P</div>
              <p className="login-eyebrow">{signedInWith ? "YOUR ACCOUNT" : "PARKING, PERSONALIZED"}</p>
              <h2 id="login-title">{signedInWith ? "Welcome, Demo User" : "Sign in to Park Pulse"}</h2>
              <p className="login-subtitle">
                {signedInWith ? `Signed in with ${signedInWith}` : "Save your parking preferences and find the right space faster."}
              </p>

              {signedInWith && (
                <div className="loyalty-card">
                  <div className="loyalty-card-heading">
                    <span className="loyalty-card-icon"><Icon name="sparkles" size={18} /></span>
                    <div><strong>Park Pulse Rewards</strong><span>{loyaltyPoints} {loyaltyPoints === 1 ? "point" : "points"} collected</span></div>
                    {freeParkingHours > 0 && <b>{freeParkingHours}h free</b>}
                  </div>
                  <div className="loyalty-dots" aria-label={`${loyaltyProgress} of 5 bookings toward the next free hour`}>
                    {Array.from({ length: 5 }, (_, index) => <span className={index < loyaltyProgress ? "earned" : ""} key={index} />)}
                  </div>
                  <p>{loyaltyProgress === 0 && loyaltyPoints > 0 ? "Reward unlocked! Your next reward starts now." : `${5 - loyaltyProgress} ${5 - loyaltyProgress === 1 ? "booking" : "bookings"} until 1 hour free.`}</p>
                </div>
              )}

              <div className="preference-heading">
                <span>Parking preferences</span>
                <small>Optional</small>
              </div>
              <div className="login-preferences" role="radiogroup" aria-label="Parking preference">
                <button
                  className={`preference-option standard-preference ${loginPreference === "standard" ? "selected" : ""}`}
                  onClick={() => setLoginPreference("standard")}
                  role="radio"
                  aria-checked={loginPreference === "standard"}
                >
                  <span className="preference-icon"><Icon name="car" size={19} /></span>
                  <span><strong>Standard car</strong><small>No special parking requirements</small></span>
                  <span className="preference-check">{loginPreference === "standard" ? "✓" : ""}</span>
                </button>
                <button
                  className={`preference-option ev-preference ${loginPreference === "ev" ? "selected" : ""}`}
                  onClick={() => setLoginPreference("ev")}
                  role="radio"
                  aria-checked={loginPreference === "ev"}
                >
                  <span className="preference-icon"><Icon name="ev" size={19} /></span>
                  <span><strong>E-car</strong><small>Show charging spaces</small></span>
                  <span className="preference-check">{loginPreference === "ev" ? "✓" : ""}</span>
                </button>
                <button
                  className={`preference-option women-preference ${loginPreference === "women" ? "selected" : ""}`}
                  onClick={() => setLoginPreference("women")}
                  role="radio"
                  aria-checked={loginPreference === "women"}
                >
                  <span className="preference-icon"><Icon name="women" size={19} /></span>
                  <span><strong>Women’s spaces</strong><small>Show designated areas</small></span>
                  <span className="preference-check">{loginPreference === "women" ? "✓" : ""}</span>
                </button>
                <button
                  className={`preference-option accessibility-preference ${loginPreference === "accessible" ? "selected" : ""}`}
                  onClick={() => setLoginPreference("accessible")}
                  role="radio"
                  aria-checked={loginPreference === "accessible"}
                >
                  <span className="preference-icon"><Icon name="accessibility" size={19} /></span>
                  <span><strong>Wheelchair access</strong><small>Show accessible parking spaces</small></span>
                  <span className="preference-check">{loginPreference === "accessible" ? "✓" : ""}</span>
                </button>
              </div>

              {signedInWith ? (
                <>
                  <button className="login-save" onClick={saveProfile}>Save preferences</button>
                  <button className="sign-out-button" onClick={signOut}>Sign out</button>
                </>
              ) : (
                <>
                  <form className="login-form" onSubmit={loginWithPassword}>
                    <label>
                      <span>Username</span>
                      <input
                        value={username}
                        onChange={(event) => {
                          setUsername(event.target.value);
                          setLoginError("");
                        }}
                        autoComplete="username"
                        placeholder="Enter your username"
                      />
                    </label>
                    <label>
                      <span>Password</span>
                      <input
                        type="password"
                        value={password}
                        onChange={(event) => {
                          setPassword(event.target.value);
                          setLoginError("");
                        }}
                        autoComplete="current-password"
                        placeholder="Enter your password"
                      />
                    </label>
                    {loginError && <p className="login-error" role="alert">{loginError}</p>}
                    <button className="password-login-button" type="submit">Sign in</button>
                  </form>
                  <div className="login-divider"><span>Or continue with</span></div>
                  <div className="provider-list">
                    <button className="provider-button google" onClick={() => loginWith("Google")}>
                      <span className="provider-mark">G</span><span>Continue with Google</span>
                    </button>
                    <button className="provider-button linkedin" onClick={() => loginWith("LinkedIn")}>
                      <span className="provider-mark">in</span><span>Continue with LinkedIn</span>
                    </button>
                    <button className="provider-button apple" onClick={() => loginWith("Apple")}>
                      <span className="provider-mark">●</span><span>Continue with Apple</span>
                    </button>
                  </div>
                  <p className="prototype-note">Prototype sign-in — no account data is transmitted.</p>
                </>
              )}
            </section>
          </div>
        )}

        {bookingMessage && (
          <div className="booking-toast" role="status">
            <span><Icon name="sparkles" size={18} /></span>
            <p>{bookingMessage}</p>
          </div>
        )}
      </section>
    </main>
  );
}
