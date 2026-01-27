import { Request, Response, NextFunction } from "express";
import * as registrationService from "../services/registration.service";
import * as camperService from "../services/camper.service";
import * as userService from "../services/user.service";

export const listAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await registrationService.findAllRegistrations();
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json(err);
  }
};

export const getAny = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await registrationService.findRegistrationById(req.params.id as string);
    if (!result)
      return res.status(404).json({ message: "Registration not found" });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const updateAny = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await registrationService.updateRegistration(req.params.id as string, req.body);
    res.status(200).json(result);
  } catch (err: any) {
    if (err.message.includes('Cannot change user or camper')) {
      return res.status(400).json({ message: err.message });
    }
    next(err);
  }
};

export const removeAny = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await registrationService.deleteRegistration(req.params.id as string);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const listMyRegistrations = async (req: Request, res: Response, next: NextFunction) => {
  try {

console.log('\n🔍 ===== DEBUG START: listMyRegistrations =====');
    console.log('🔍 Request user object:', req.user);
    console.log('🔍 Request user type:', typeof req.user);
    
    // Try multiple possible keys
    const userId = req.user?.userId || req.user?.id || req.user?._id || req.user?.sub;
    console.log('🔍 Extracted userId:', userId);
    console.log('🔍 userId type:', typeof userId);
    



  // const userId = req.user.userId;


  if (!userId) {
      console.error('❌ ERROR: No userId found in request user object');
      console.log('❌ Available keys:', Object.keys(req.user || {}));
      return res.status(401).json({ message: 'User ID not found in token' });
    }

    

    console.log(`🔍 Calling service with userId: ${userId}`);
    console.log(`🔍 userId length: ${userId.length}`);






    const result = await registrationService.findRegistrationsByUser(userId);
   
   
   
   console.log(`✅ Service returned ${result?.length || 0} registrations`)
    
    if (result && result.length > 0) {
      result.forEach((reg: any, index: number) => {
        console.log(`📝 Registration ${index + 1}:`);
        console.log(`   - Registration ID: ${reg._id}`);
        console.log(`   - User field type: ${typeof reg.user}`);
        console.log(`   - User ID: ${reg.user?._id || reg.user}`);
        console.log(`   - Username: ${reg.user?.username || 'N/A'}`);
      });
    } else {
      console.log('📭 No registrations found for this user');
    }
    
    console.log('===== DEBUG END =====\n');


   
   
   
    res.status(200).json(result);




    




  } catch (err: any) {

  console.error('❌ Error in listMyRegistrations:', err);
  console.error('❌ Stack trace:', err.stack);

    res.status(400).json(err);
  }
};

export const createMyRegistration = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.userId;
    const registrationData = {
      ...req.body,
      user: userId
    };

    const result = await registrationService.createRegistration(registrationData);
    res.status(201).json(result);
  } catch (err: any) {
    if (err.message.includes('already exists')) {
      return res.status(409).json({ message: err.message });
    }
    if (err.message.includes('not found')) {
      return res.status(404).json({ message: err.message });
    }
    if (err.message.includes('does not belong')) {
      return res.status(403).json({ message: err.message });
    }
    if (err.message.includes('not available')) {
      return res.status(400).json({ message: err.message });
    }
    next(err);
  }
};

export const getMyRegistration = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.userId;
    const registrationId = req.params.id;

    const result = await registrationService.findRegistrationById(registrationId as string);
    if (!result)
      return res.status(404).json({ message: "Registration not found" });

    if (result.user._id.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const removeMyRegistration = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.userId;
    const registrationId = req.params.id;

    const existingReg = await registrationService.findRegistrationById(registrationId as string);
    if (!existingReg)
      return res.status(404).json({ message: "Registration not found" });

    if (existingReg.user._id.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    const result = await registrationService.deleteRegistration(registrationId as string);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const listMyCampers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.userId;
    const result = await camperService.findCampersByUser(userId);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json(err);
  }
};

export const createMyCamper = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.userId;

    const camperData = {
      ...req.body,
      parent: userId,
      dateOfBirth: new Date(req.body.dateOfBirth)
    };

    const result = await camperService.createCamper(camperData);
    res.status(201).json(result);
  } catch (err: any) {
    if (err.message.includes('already exists')) {
      return res.status(409).json({ message: err.message });
    }
    next(err);
  }
};

export const getMyCamper = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.userId;
    const camperId = req.params.id;

    const result = await camperService.findCamperById(camperId as string);
    if (!result)
      return res.status(404).json({ message: "Camper not found" });

    if (result.parent._id.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const updateMyCamper = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.userId;
    const camperId = req.params.id;

    const existingCamper = await camperService.findCamperById(camperId as string);
    if (!existingCamper)
      return res.status(404).json({ message: "Camper not found" });

    if (existingCamper.parent._id.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    const result = await camperService.updateCamper(camperId as string, req.body);
    res.status(200).json(result);
  } catch (err: any) {
    if (err.message.includes('already has this AMKA')) {
      return res.status(409).json({ message: err.message });
    }
    next(err);
  }
};

export const removeMyCamper = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.userId;
    const camperId = req.params.id;

    const existingCamper = await camperService.findCamperById(camperId as string);
    if (!existingCamper)
      return res.status(404).json({ message: "Camper not found" });

    if (existingCamper.parent._id.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    const result = await camperService.deleteCamper(camperId as string);
    res.status(200).json(result);
  } catch (err: any) {
    if (err.message.includes('Cannot delete camper')) {
      return res.status(400).json({ message: err.message });
    }
    next(err);
  }
};

export const checkCamperAmka = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { amka } = req.body;

    if (!amka) {
      return res.status(400).json({ message: "AMKA parameter is required" });
    }

    if (!/^\d{11}$/.test(amka)) {
      return res.status(400).json({ message: "AMKA must be exactly 11 digits" });
    }

    const existingCamper = await camperService.findCamperByAmka(amka);
    const existingUser = await userService.findUserByAmka(amka);

    res.status(200).json({
      available: !existingCamper && !existingUser,
      isParentAmka: !!existingUser,
      isCamperAmka: !!existingCamper,
      message: existingCamper ? "AMKA registered as camper" :
        existingUser ? "AMKA registered as parent" :
          "AMKA available"
    });
  } catch (err) {
    next(err);
  }
};

export const listAllCampers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await camperService.findAllCampers();
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json(err);
  }
};

export const removeAnyCamper = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await camperService.deleteCamper(req.params.id as string);
    res.status(200).json(result);
  } catch (err: any) {
    if (err.message.includes('Cannot delete camper')) {
      return res.status(400).json({ message: err.message });
    }
    next(err);
  }
};

export const searchByAmka = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { amka, type } = req.body;

    if (!amka) {
      return res.status(400).json({ message: "AMKA is required" });
    }

    if (!type || (type !== 'parent' && type !== 'camper')) {
      return res.status(400).json({ message: "Type must be 'parent' or 'camper'" });
    }

    if (type === 'parent') {
      const result = await registrationService.findRegistrationsByParentAmka(amka);
      res.status(200).json(result);
    } else {
      const result = await registrationService.findRegistrationByCamperAmka(amka);
      res.status(200).json(result);
    }
  } catch (err) {
    res.status(400).json(err);
  }
};