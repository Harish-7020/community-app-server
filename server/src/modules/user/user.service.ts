import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/shared/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {}

    async createUser(createUserDto: CreateUserDto) {

        const user = new User();
        user.firstName = createUserDto.firstName;
        user.lastName = createUserDto.lastName;
        user.email = createUserDto.email;
        user.password = await this.passwordHash(createUserDto.password);
        user.createdAt = new Date();
        user.aboutMe = createUserDto.aboutMe;
        user.profilePicture = createUserDto.profilePicture; 
        const data = this.userRepository.create(user);
        return this.userRepository.save(data);
    }

    async updateUser(id: number, updateUserDto: UpdateUserDto) {
        const userExists = await this.userRepository.findOne({ where: { userID: id } });
        if (!userExists) throw new NotFoundException('User not found');
      
        Object.assign(userExists, updateUserDto);
        userExists.modifiedAt = new Date();
      
        return this.userRepository.save(userExists);
    }

    
    async updateProfilePicture(userID: number, profilePicturePath: string) {
        const user = await this.userRepository.findOne({ where: { userID } });
        if (!user) throw new NotFoundException('User not found');
        user.profilePicture = profilePicturePath;
        return this.userRepository.save(user);
    }

    async getUserById(id: number) {
        return this.userRepository.findOne({
            where: { userID: Number(id) },
            select: [
                'userID',
                'firstName',
                'lastName',
                'email',
                'aboutMe',
                'profilePicture',
                // Explicitly include timestamps that are select:false by default
                'createdAt',
                'modifiedAt',
            ],
        });
    }

    async deleteUser(id: number) {
        const user = await this.userRepository.findOne({ where: { userID: Number(id) } });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        user.deletedAt = new Date();
        return this.userRepository.save(user);
    }

    async getUsers() {
        return this.userRepository.find({
            select: [
                'userID',
                'firstName',
                'lastName',
                'email',
                'profilePicture',
                'aboutMe',
            ]
        });
    }

    async findByEmail(email: string) {
        return this.userRepository.findOne({ where: { email } });
    }


    async getUserPasswordByUserId(userID: number, password: any): Promise<string> {
        let userData = await this.userRepository
          .findOne({
            where: { userID },
            select: ['password'],
          })
        let isValidPass = await this.passwordCheck(userData?.password || '', password);
        return userData?.password || '';
    }

    passwordHash(password: string): Promise<string> {
        return bcrypt.hash(password, 2).catch((err) => {
          throw new Error(err);
        });
      }

    async passwordCheck(password: string, passwordToCheck: string) {
        return await bcrypt.compare(passwordToCheck, password);
    }

    async updateTemporaryPassword(userID: number, password: string) {
        return this.userRepository.update(userID, {
          password: password,
        });
      }

    async userLoginObj(user: User) {
    const foundUser = await this.userRepository.findOne({
        where: {userID: user.userID},
        select: [
        'userID',
        'firstName',
        'lastName',
        'email',
        'createdAt',
        'modifiedAt',
        'deletedAt',
        'profilePicture',
        'aboutMe',
        ],
    });

    if (!foundUser) throw new Error('User not found');
    
    return {
        userID: foundUser.userID,
        firstName: foundUser.firstName,
        lastName: foundUser.lastName,
        email: foundUser.email,
        createdAt: foundUser.createdAt,
        modifiedAt: foundUser.modifiedAt,
        deletedAt: foundUser.deletedAt,
    };
    }

    async followUser(followerId: number, followingId: number) {
        // For now, return success - implement actual follow logic if needed
        return { success: true, message: 'User followed' };
    }

    async unfollowUser(followerId: number, followingId: number) {
        // For now, return success - implement actual unfollow logic if needed
        return { success: true, message: 'User unfollowed' };
    }

    async isFollowing(followerId: number, followingId: number) {
        // For now, return false - implement actual follow check if needed
        return { isFollowing: false };
    }

    }

