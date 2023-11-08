const PrivacyPolicy = () => {
  return (
    <div className="mx-3 flex flex-col gap-5 bg-gray-400 p-2 py-10 text-black sm:mx-20 md:mx-32">
      <h1 className="text-2xl font-bold sm:text-3xl">Privacy Policy</h1>

      <p>
        Welcome to Ramsay's Detailing ("us", "we", or "our"). We are committed
        to protecting your personal information and your right to privacy. If
        you have any questions or concerns about our policy, or our practices
        with regards to your personal information, please contact us at{" "}
        <a href="mailto:sebastien.ramsay@gmail.com">
          sebastien.ramsay@gmail.com
        </a>
        .
      </p>

      <p>
        When you use our mobile application, as the case may be (the "App") and
        more generally, use any of our services (the "Services", which include
        the App), we appreciate that you are trusting us with your personal
        information. We take your privacy very seriously. In this privacy
        policy, we seek to explain to you in the clearest way possible what
        information we collect, how we use it, and what rights you have in
        relation to it. We hope you take some time to read through it carefully,
        as it is important. If there are any terms in this privacy policy that
        you do not agree with, please discontinue use of our Services
        immediately.
      </p>

      <h2>1. Information We Collect</h2>

      <h3>Sign-In with Google</h3>

      <p>
        To provide you with a seamless experience, our App offers the option to
        sign in using your Google account. By choosing this method of sign-in,
        you authorize us to collect and use certain information from your Google
        account as outlined in this Privacy Policy. This includes your name,
        email address, and profile picture. We do not have access to your Google
        account password.
      </p>

      <h2>2. Use of Google Calendar using OAuth</h2>

      <p>
        Our App may also request access to your Google Calendar through OAuth
        (Open Authorization) for specific functionalities, such as adding events
        or appointments to your Google Calendar. This access is explicitly
        requested by you and is used solely for the purpose of integrating the
        functionality you expect. We do not store or retain your Google Calendar
        data beyond the scope of the features provided by our App.
      </p>

      <h2>3. Limited Use Requirements</h2>
      <p>
        In compliance with Google's Limited Use Requirements, we want to inform
        our users that our app strictly adheres to the Google API Services User
        Data Policy, including the Limited Use requirements. For more details,
        please refer to the{" "}
        <Link href="https://developers.google.com/terms/api-services-user-data-policy">
          Google API Services User Data Policy
        </Link>
        . Your privacy and data security are important to us, and we are
        committed to ensuring your information is handled with care and in
        accordance with these guidelines.
      </p>

      <h2>4. How We Use Your Information</h2>

      <p>We use the information we collect or receive:</p>
      <ul>
        <li>
          To facilitate account creation and logon process with your Google
          account.
        </li>
        <li>To provide, support, and improve the Services we offer.</li>
        <li>To personalize your experience using our App.</li>
        <li>
          To provide you with information or updates related to our Services.
        </li>
        <li>To contact you if necessary or requested.</li>
        <li>To fulfill any other purpose for which you provide it.</li>
      </ul>

      <h2>5. Your Privacy Choices</h2>

      <p>
        You may review, change, or remove the permissions granted to our App in
        your Google account settings at any time.
      </p>

      <h2>6. Security of Your Information</h2>

      <p>
        We take the security of your personal information seriously. We
        implement reasonable administrative, technical, and physical measures to
        protect your information from unauthorized access, accidental loss, or
        destruction.
      </p>

      <h2>7. Changes to this Privacy Policy</h2>

      <p>
        We may update our privacy policy from time to time. Thus, you are
        advised to review this page periodically for any changes. We will notify
        you of any changes by posting the new privacy policy on this page.
      </p>

      <h2>8. Contact Us</h2>

      <p>
        If you have any questions or suggestions about our privacy policy, do
        not hesitate to contact us at{" "}
        <a href="mailto:sebastien.ramsay@gmail.com">
          sebastien.ramsay@gmail.com
        </a>
        .
      </p>
    </div>
  );
};

export default PrivacyPolicy;
