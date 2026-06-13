import React from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, Compass, ServerCrash } from "lucide-react";

// Generic Base Error Layout
export const ErrorLayout = ({ code, title, description, icon: Icon }) => {
  return (
    <div className="error-page-container">
      {Icon && <Icon size={64} color="var(--color-primary)" style={{ marginBottom: "16px" }} />}
      <h1 className="error-code">{code}</h1>
      <h2 className="error-title">{title}</h2>
      <p className="error-description">{description}</p>
      <Link to="/" className="btn btn-primary">
        Return to Dashboard
      </Link>
    </div>
  );
};

// 404 - Not Found Page
export const NotFoundPage = () => {
  return (
    <ErrorLayout
      code="404"
      title="Page Not Found"
      description="The page you are looking for might have been removed, had its name changed, or is temporarily unavailable."
      icon={Compass}
    />
  );
};

// 403 - Unauthorized Page
export const UnauthorizedPage = () => {
  return (
    <ErrorLayout
      code="403"
      title="Access Denied"
      description="You do not have the required permissions to access this page. Please contact your system administrator if you believe this is an error."
      icon={ShieldAlert}
    />
  );
};

// 500 - Server Error Page
export const ServerErrorPage = () => {
  return (
    <ErrorLayout
      code="500"
      title="Internal Server Error"
      description="The server encountered an internal error or misconfiguration and was unable to complete your request. Please try again later."
      icon={ServerCrash}
    />
  );
};

export default ErrorLayout;
