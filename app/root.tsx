import {
  Form,
  Link,
  Links,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigation,
  useSubmit,
  useLocation,
} from "@remix-run/react";
import { useEffect, useState } from "react";
import {
  json,
  redirect,
  type LoaderFunctionArgs,
  type LinksFunction,
} from "@remix-run/node";
import { createEmptyContact, getContacts } from "./data";
import { getSession } from "./utils/session.server";
import appStylesHref from "./app.css?url";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: appStylesHref },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const contacts = await getContacts(q);

  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("userId"); // 로그인 액션에서 저장한 키에 맞춰서 변경

  return json({ contacts, q, userId });
};

export const action = async () => {
  const contact = await createEmptyContact();
  return redirect(`/contacts/${contact.id}/edit`);
};

export default function App() {
  const { contacts, q, userId } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const submit = useSubmit();
  const location = useLocation();
  const searching =
    navigation.location &&
    new URLSearchParams(navigation.location.search).has("q");

  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const searchField = document.getElementById("q");
    if (searchField instanceof HTMLInputElement) {
      searchField.value = q || "";
    }
  }, [q]);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  // 로그인 안 되어 있으면 사이드바 숨기기
  const hideSidebar = !userId;

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {!hideSidebar && (
          <button
            onClick={toggleSidebar}
            style={{
              position: "fixed",
              top: "1.5rem",
              left: "1rem",
              zIndex: 1000,
              background: "none",
              border: "none",
              cursor: "pointer",
              width: "40px",
              height: "40px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-around",
              alignItems: "center",
              padding: "6px 0",
              borderRadius: "6px",
              userSelect: "none",
            }}
            aria-label="Toggle sidebar"
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: "25px",
                  height: "3px",
                  backgroundColor: "#2563EB",
                  borderRadius: "2px",
                }}
              />
            ))}
          </button>
        )}

        {!hideSidebar && sidebarOpen && (
          <div
            id="sidebar"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              bottom: 0,
              width: "320px",
              background: "#f0f0f0",
              padding: "1rem",
              overflowY: "auto",
              zIndex: 999,
            }}
          >
            <h1>Remix Contacts</h1>
            <div>
              <Form
                id="search-form"
                role="search"
                onChange={(event) => {
                  const isFirstSearch = q === null;
                  submit(event.currentTarget, {
                    replace: !isFirstSearch,
                  });
                }}
              >
                <input
                  id="q"
                  aria-label="Search contacts"
                  className={searching ? "loading" : ""}
                  defaultValue={q || ""}
                  placeholder="Search"
                  type="search"
                  name="q"
                  style={{ marginLeft: "2rem", width: "150px" }}
                />
                <div id="search-spinner" hidden={!searching} />
              </Form>
              <Form method="post">
                <button type="submit" style={{ marginLeft: "0.3rem" }}>
                  New
                </button>
              </Form>
            </div>
            <nav>
              {contacts.length ? (
                <ul>
                  {contacts.map((contact) => (
                    <li key={contact.id}>
                      <NavLink
                        className={({ isActive, isPending }) =>
                          isActive ? "active" : isPending ? "pending" : ""
                        }
                        to={`contacts/${contact.id}`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <Link to={`contacts/${contact.id}`}>
                          {contact.first || contact.last ? (
                            <>
                              {contact.first} {contact.last}
                            </>
                          ) : (
                            <i>No Name</i>
                          )}{" "}
                          {contact.favorite ? <span>★</span> : null}
                        </Link>
                      </NavLink>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>
                  <i>No contacts</i>
                </p>
              )}
            </nav>
          </div>
        )}

        <div
          id="detail"
          className={
            navigation.state === "loading" && !searching ? "loading" : ""
          }
          style={{
            marginLeft: !hideSidebar && sidebarOpen ? "260px" : "0",
            transition: "margin-left 0.3s",
          }}
        >
          <Outlet />
        </div>

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
