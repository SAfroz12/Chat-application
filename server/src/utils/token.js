const jwt=require("jsonwebtoken");
const generateAccessToken=(userId)=>{
    return jwt.sign( 
        {userId},
        process.env.JWT_ACCESS_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRES,
        }

    )
}
const generateRefreshToken=(userId)=>{

  return jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES,
    }
  );
};
module.exports={
    generateAccessToken,
    generateRefreshToken

}