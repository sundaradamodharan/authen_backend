router.post("/refresh_token", async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ error: "No refresh token provided" });

  try {
    const payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

    // Check user in DB
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [payload.id]);
    if (!result.rows.length) return res.status(401).json({ error: "User not found" });

    // Issue new access token
    const accessToken = jwt.sign(
      { id: result.rows[0].id, role: result.rows[0].role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.json({ accessToken });
  } catch (err) {
    return res.status(403).json({ error: "Invalid refresh token" });
  }
});
