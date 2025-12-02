import { redirect } from "react-router";
import { destroySession, getSession } from "~/utils/session.server";

/**
 * Action for sign-out route.
 * Clears the user session and redirects to sign-in.
 *
 * @param request Action request object
 */
export async function action({ request }: { request: Request }) {
  const session = await getSession(request.headers.get("Cookie"));
  return redirect("/sign-in", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
}