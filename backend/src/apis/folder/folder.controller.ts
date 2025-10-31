/** Controller for updating an existing user profile
 *
 * This function handles PUT requests to update a profile's information. It validates
 * both the request body and parameters, checks session authorization, and updates
 * the profile in the database if all validations pass.
 *
 * @param {Request} request - Express request object containing:
 *   - body: Profile data to update (about, imageUrl, name)
 *   - params: URL parameters containing the profile id
 *   - session: Session data containing the authenticated user's profile
 * @param {Response} response - Express response object used to send back:
 *   - Success response with updated profile data
 *   - Error responses for validation failures, authorization issues, or missing profiles
 *
 * @returns {Promise<void>} Returns nothing, but sends JSON response to client
 *
 * @throws Will send error responses for:
 *   - Invalid request body (400)
 *   - Invalid request parameters (400)
 *   - Unauthorized update attempt (400)
 *   - Profile not found (400)
 *
 * @example
 * // PUT /api/profile/:id
 * // Request body: { about: "New bio", imageUrl: "https://...", name: "John Doe" }
 * // Response: { status: 200, message: "Profile updated successfully", data: updatedProfile } **/
