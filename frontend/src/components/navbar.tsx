import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

import {
  Menu,
  X,
  User,
  CalendarHeart,
  LogOut,
  LayoutDashboard,
} from "lucide-react";



import "./navbar.css";


export default function Navbar() {


  const navigate = useNavigate();
  const location = useLocation();


  const [mobileOpen, setMobileOpen] = useState(false);



  const token = localStorage.getItem("token");
  const userName = localStorage.getItem("userName");
  const userRole = localStorage.getItem("userRole");




  const handleLogout = () => {

    localStorage.removeItem("userId");
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");


    navigate("/");

    window.location.reload();

  };




  const closeMenu = () => {

    setMobileOpen(false);

  };




  return (

    <header className="navbar-wrapper">


      <nav className="pill-navbar">



        {/* LOGO SECTION */}

        <Link
          to="/"
          className="navbar-logo"
          onClick={closeMenu}
        >





          <div className="logo-text">

            <h2>
              GlowHaven
            </h2>

            <span>
              Beauty Studio
            </span>

          </div>



        </Link>






        {/* MOBILE MENU BUTTON */}

        <button
          className="mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle Menu"
        >

          {
            mobileOpen
              ?
              <X size={28} />
              :
              <Menu size={28} />
          }


        </button>







        {/* NAV LINKS */}

        <div
          className={`navbar-center ${mobileOpen ? "open" : ""
            }`}
        >




          <Link
            to="/"
            onClick={closeMenu}
            className={
              location.pathname === "/"
                ?
                "active"
                :
                ""
            }
          >

            Home

          </Link>





          <a
            href="/#about"
            onClick={closeMenu}
          >

            About

          </a>





          <Link
            to="/booking-service"
            onClick={closeMenu}
            className={
              location.pathname === "/booking-service"
                ?
                "active"
                :
                ""
            }
          >

            Services

          </Link>





          <Link
            to="/staff"
            onClick={closeMenu}
            className={
              location.pathname === "/staff"
                ?
                "active"
                :
                ""
            }
          >

            Staff

          </Link>





          <Link
            to="/contact"
            onClick={closeMenu}
            className={
              location.pathname === "/contact"
                ?
                "active"
                :
                ""
            }
          >

            Contact

          </Link>







          {
            userRole !== "admin" &&

            <Link
              to="/booking"
              onClick={closeMenu}
              className="book-now-link"
            >

              <CalendarHeart size={18} />

              Book Now


            </Link>

          }

          {/* Mobile Auth Section */}
          <div className="mobile-auth-links">
            {!token ? (
              <>
                <Link
                  to="/signup"
                  onClick={closeMenu}
                  className="nav-right-link"
                >
                  Sign Up
                </Link>
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="login-btn"
                >
                  Login
                </Link>
              </>
            ) : (
              <div className="nav-user-section-mobile">
                <Link
                  to="/account"
                  onClick={closeMenu}
                  className="nav-user-name-link"
                >
                  <User size={16} />
                  Hi, {userName}
                </Link>

                {userRole === "admin" && (
                  <Link
                    to="/dashboard"
                    onClick={closeMenu}
                    className="nav-admin-link"
                  >
                    <LayoutDashboard size={16} />
                    Dashboard
                  </Link>
                )}

                <button
                  className="nav-logout-button"
                  onClick={() => {
                    handleLogout();
                    closeMenu();
                  }}
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>

        </div>









        {/* RIGHT SECTION */}


        <div className="navbar-right">


          {

            !token ?


              (

                <>


                  <Link
                    to="/signup"
                    className="nav-right-link"
                  >

                    Sign Up

                  </Link>





                  <Link
                    to="/login"
                    className="login-btn"
                  >

                    Login

                  </Link>



                </>


              )


              :


              (


                <div className="nav-user-section">





                  <Link
                    to="/account"
                    className="nav-user-name-link"
                  >

                    <User size={16} />

                    Hi, {userName}


                  </Link>







                  {

                    userRole === "admin" &&


                    <Link
                      to="/dashboard"
                      className="nav-admin-link"
                    >

                      <LayoutDashboard size={16} />

                      Dashboard


                    </Link>


                  }








                  <button
                    className="nav-logout-button"
                    onClick={handleLogout}
                  >

                    <LogOut size={16} />

                    Logout


                  </button>




                </div>


              )

          }


        </div>




      </nav>


    </header>

  );

}