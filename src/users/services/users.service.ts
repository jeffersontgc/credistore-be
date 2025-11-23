import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { CreateUserInput } from '../dto/create-user.input';
import { User } from 'src/users/entities/users.entity';
import { SuccessReponse } from 'src/utils/response';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(args: CreateUserInput): Promise<SuccessReponse> {
    // valdate if user exists
    const existeUser = await this.validaExisteUser(args.email);

    if (existeUser) {
      throw new ConflictException(
        `User with email ${args.email} already exists`,
      );
    }

    // hash password
    const hashedPassword = await bcrypt.hash(args.password, 10);

    const user = this.usersRepository.create({
      ...args,
      uuid: uuidv4(),
      password: hashedPassword,
    });

    await this.usersRepository.save(user);

    return {
      status: 'ok',
      message: 'User created successfully',
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({
      where: { email },
    });
    return user;
  }

  async findByUuid(uuid: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({
      where: { uuid },
    });
    return user;
  }

  async validaExisteUser(email: string): Promise<boolean> {
    const user = await this.usersRepository.findOne({
      where: { email },
    });

    if (!user) {
      return false;
    }
    return true;
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      relations: ['debts'],
      where: {
        isCeo: false,
      },
    });
  }

  async asyncFindByUuid(uuid: string): Promise<User | null> {
    const user = await this.usersRepository.findOneOrFail({
      where: { uuid },
      relations: ['debts'],
    });

    return user;
  }
}
