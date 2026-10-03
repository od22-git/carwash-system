import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import {
  createUserSchema,
  updateUserSchema,
  type CreateUserRequest,
  type UpdateUserRequest,
} from '@carwash/shared';
import { Roles, ZodPipe } from '../../common';
import { UsersService } from './users.service';

/** The admin manages accounts (e.g. creates the cashier's login). */
@Roles('admin')
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  list() {
    return this.users.list();
  }

  @Post()
  create(@Body(new ZodPipe(createUserSchema)) body: CreateUserRequest) {
    return this.users.create(body);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodPipe(updateUserSchema)) body: UpdateUserRequest,
  ) {
    return this.users.update(id, body);
  }
}
