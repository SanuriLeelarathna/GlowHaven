import { Request, Response } from "express";
import Review from "../models/review";


// Customer submit review
export const createReview = async (
    req: Request,
    res: Response
) => {

    try {

        const { name, rating, comment } = req.body;


        const review = new Review({

            name,
            rating,
            comment

        });


        await review.save();


        res.status(201).json({

            message: "Review submitted successfully",
            review

        });


    } catch (error) {

        console.error(error);

        res.status(500).json({

            message: "Failed to submit review"

        });

    }

};



// Home page - approved reviews only
export const getReviews = async (
    req: Request,
    res: Response
) => {

    try {

        const reviews = await Review.find({

            status: "approved"

        })
            .sort({
                createdAt: -1
            });


        res.json(reviews);


    } catch (error) {

        res.status(500).json({

            message: "Failed to fetch reviews"

        });

    }

};



// Admin - get pending reviews
export const getPendingReviews = async (
    req: Request,
    res: Response
) => {

    try {


        const reviews = await Review.find({

            status: "pending"

        })
            .sort({
                createdAt: -1
            });


        res.json(reviews);



    } catch (error) {


        res.status(500).json({

            message: "Failed to fetch pending reviews"

        });


    }

};




// Admin - approve review
export const approveReview = async (
    req: Request,
    res: Response
) => {

    try {


        const review = await Review.findByIdAndUpdate(

            req.params.id,

            {
                status: "approved"
            },

            {
                new: true
            }

        );


        if (!review) {

            return res.status(404).json({

                message: "Review not found"

            });

        }


        res.json({

            message: "Review approved successfully",

            review

        });



    } catch (error) {


        res.status(500).json({

            message: "Failed to approve review"

        });

    }

};
// Admin - reject review
export const rejectReview = async (
    req: Request,
    res: Response
) => {

    try {

        const review = await Review.findByIdAndDelete(
            req.params.id
        );


        if (!review) {

            return res.status(404).json({

                message: "Review not found"

            });

        }


        res.json({

            message: "Review rejected successfully"

        });


    } catch (error) {

        console.error(error);

        res.status(500).json({

            message: "Failed to reject review"

        });

    }

};