import Link from "next/link";

interface HeaderProps {
  activeTop: string;
  activeBottom?: string;
}

export default function Header({ activeTop, activeBottom }: HeaderProps) {
  const topLinks = ["Explore", "Upload", "Saved", "Created"];
  const bottomLinks = ["Samples", "Presets", "Packs"];

  const baseLinkClasses =
    "block py-1 text-white hover:text-zinc-800 hover:bg-cyan-400 transition-colors text-center";
  const activeLinkClasses =
    "bg-cyan-400 text-shadow-white font-semibold rounded-lg";

  const showBottomLinks = topLinks.includes(activeTop);

  return (
    <header className="w-full fixed top-0 z-50">
      <nav className="bg-zinc-800">
        <ul className="flex justify-center space-x-2">
          <li className="flex-1 min-w-[140px]">
            <Link
              href="/login"
              className={`${baseLinkClasses} ${
                activeTop === "Login" ? activeLinkClasses : ""
              }`}
            >
              Login
            </Link>
          </li>
          <li className="flex-1 min-w-[140px]">
            <Link
              href="/profile"
              className={`${baseLinkClasses} ${
                activeTop === "Profile" ? activeLinkClasses : ""
              }`}
            >
              Profile
            </Link>
          </li>

          {topLinks.map((link) => (
            <li key={link} className="flex-1 min-w-[140px]">
              <Link
                href={`/${link.toLowerCase()}/samples`}
                className={`${baseLinkClasses} ${
                  activeTop === link ? activeLinkClasses : ""
                }`}
              >
                {link}
              </Link>
            </li>
          ))}
        </ul>

        {showBottomLinks && (
          <ul className="flex justify-center space-x-2 mt-1">
            {bottomLinks.map((link) => (
              <li key={link} className="flex-1 min-w-[140px]">
                <Link
                  href={`/${activeTop.toLowerCase()}/${link.toLowerCase()}`}
                  className={`${baseLinkClasses} ${
                    activeBottom === link ? activeLinkClasses : ""
                  }`}
                >
                  {link}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </nav>
    </header>
  );
}
