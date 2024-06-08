export type ErrorResponse = { error: { type: string; message: string } };
export type AuthResponse = ErrorResponse | { userId: string };

const auth = (bearerToken: string): Promise<AuthResponse> => {
  return new Promise((resolve, reject) => {
    const token = bearerToken.replace("Bearer ", "");
    if (token === "fakeToken") {
      resolve({ userId: "faceUserId" });
      return;
    }

    resolve({
      error: { type: "unauthorized", message: "Authentication Failed" },
    });
  });
};

export default { auth: auth };
