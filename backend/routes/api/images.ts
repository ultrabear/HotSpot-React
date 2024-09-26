import { Router, Request, Response, NextFunction } from "express";
import { check } from "express-validator";
import { handleValidationErrors } from "../../utils/validation.js";

const router = Router();

import bcrypt from "bcryptjs";
import { setTokenCookie, restoreUser, requireAuth } from "../../utils/auth.js";
import { prisma } from "../../dbclient.js";



// ! Delete spot by imageId


router.delete('/:imageId', async (req, res) => {
    try {
  
      const {imageId} = req.params.imageId;
  
  
      const userId = req.user;
  
  
      const spot = await prisma.spots.findFirst({
        where: {
          ownerId: userId,
          images: {
            some: {
              id: imageId,
            },
          },
        },
      });
  
      
      if (spot) {
        await prisma.images.delete({
          where: {
            id: imageId,
          },
        });
  
        res.status(200).json({ message: `Spot image with id ${imageId} deleted successfully` });
      } 
        res.status(404).json({ error: `Couldn't find a Spot Image with the specified id ${imageId} that belongs to the current user` });
      }
    } catch (error) {
      
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });




// ! delete a review image by imageId

router.delete('/api/review-images/:imageId', async (req, res) => {
    try {
  
      const {imageId} = req.params.imageId;
  
      const {userId} = req.user.id;
  
     
      const review = await prisma.reviews.findFirst({
        where: {
          bookingId: {
            in: (await prisma.bookings.findMany({ where: 
              { guest_id: userId } }))
              .map(booking => booking.id),
          },
          images: {
            some: {
              id: imageId,
            },
          },
        },
      });
  
      if (review) {
        await prisma.images.delete({
          where: {
            id: imageId,
          },
        });
  
        res.status(200).json({ message: `Successfully Deleted` });
      } else {
  
        res.status(404).json({ error: `Couldn't find a Review Image with id ${imageId}` });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
     
