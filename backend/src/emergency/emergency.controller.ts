import { Controller, Get } from '@nestjs/common';
import { EMERGENCY_CONTACTS } from './emergency-contacts.data';

@Controller('emergency-contacts')
export class EmergencyController {
  @Get()
  list() {
    return EMERGENCY_CONTACTS;
  }
}
