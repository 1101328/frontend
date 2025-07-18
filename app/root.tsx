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

import { useEffect } from "react";
import { redirect, type LoaderFunctionArgs, type LinksFunction } from "@remix-run/node";
import { createEmptyContact, getContacts } from "./data";

import appStylesHref from "./app.css?url";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: appStylesHref },
];

// ✅ 로그인/회원가입 경로 감지 함수 수정
function isLoginPath(pathname: string) {
  return pathname.startsWith("/login") || pathname.startsWith("/register");
}

export const action = async () => {
  const contact = await createEmptyContact();
  return redirect(`/contacts/${contact.id}/edit`);
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const contacts = await getContacts(q);
  return { contacts, q };
};

export default function App() {
  const { contacts, q } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const submit = useSubmit();
  const location = useLocation();
  const searching =
    navigation.location &&
    new URLSearchParams(navigation.location.search).has("q");

  const hideSidebar = isLoginPath(location.pathname);

  useEffect(() => {
    const searchField = document.getElementById("q");
    if (searchField instanceof HTMLInputElement) {
      searchField.value = q || "";
    }
  }, [q]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {/* ✅ 로그인/회원가입에서는 사이드바 숨김 */}
        {!hideSidebar && (
          <div id="sidebar">
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
                />
                <div id="search-spinner" hidden={!searching} />
              </Form>
              <Form method="post">
                <button type="submit">New</button>
              </Form>
            </div>
            <nav>
              {contacts.length ? (
                <ul>
                  {contacts.map((contact) => (
                    <li key={contact.id}>
                      <NavLink
                        className={({ isActive, isPending }) =>
                          isActive
                            ? "active"
                            : isPending
                            ? "pending"
                            : ""
                        }
                        to={`contacts/${contact.id}`}
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
        >
          <Outlet />
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}