import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as pactum from 'pactum';
import { RegisterDto } from '../src/auth/dto/register.dto';
import { UserService } from '../src/user/user.service';
import { LoginDto } from '../src/auth/dto/login.dto';
import { AddTaskDto } from '../src/task/dto/add-task.dto';
import { TaskStatus } from '../src/task/schemas/task.schema';
import { EditTaskDto } from '../src/task/dto/edit-task.dto';

describe('TryHackMe Challenge e2e', () => {
    let app: INestApplication;
    let configService: ConfigService;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();
        app = moduleRef.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
        configService = app.get(ConfigService);
        await app.init();
        const port = configService.getOrThrow('PORT');
        await app.listen(port);
        const connection = app.get(UserService).getConnection();
        await connection.db.dropDatabase();
        pactum.request.setBaseUrl(`http://localhost:${port}`);
    });

    afterAll(async () => {
        app.close();
    });

    describe('Auth', () => {
        const path = '/auth/register';

        describe('register', () => {
            const dto: RegisterDto = {
                name: 'Test User',
                email: 'tryhackme@example.com',
                password: 'TestPassword',
            };

            it('should return register a user with valid input', () => {
                return pactum.spec().post(path).withBody(dto).expectStatus(201);
            });

            it('should throw if user already exists', () => {
                return pactum.spec().post(path).withBody(dto).expectStatus(403);
            });

            it('should throw if name is empty', () => {
                return pactum
                    .spec()
                    .post(path)
                    .withBody({ email: dto.email, password: dto.password })
                    .expectStatus(400);
            });

            it('should throw if email is empty', () => {
                return pactum
                    .spec()
                    .post(path)
                    .withBody({ name: dto.name, password: dto.password })
                    .expectStatus(400);
            });

            it('should throw if password is empty', () => {
                return pactum
                    .spec()
                    .post(path)
                    .withBody({ name: dto.name, email: dto.email })
                    .expectStatus(400);
            });

            it('should throw if body is empty', () => {
                return pactum.spec().post(path).expectStatus(400);
            });
        });

        describe('login', () => {
            const path = '/auth/login';

            const dto: LoginDto = {
                email: 'tryhackme@example.com',
                password: 'TestPassword',
            };

            it('should login with correct credentials', () => {
                return pactum
                    .spec()
                    .post(path)
                    .withBody(dto)
                    .expectStatus(201)
                    .stores('accessToken', 'access_token');
            });

            it('should throw with incorrect email', () => {
                return pactum
                    .spec()
                    .post(path)
                    .withBody({ ...dto, email: 'tryh4xxme@example.com' })
                    .expectStatus(403);
            });

            it('should throw with incorrect password', () => {
                return pactum
                    .spec()
                    .post(path)
                    .withBody({ ...dto, password: 'TryingToHackYou' })
                    .expectStatus(403);
            });

            it('should throw if email is empty', () => {
                return pactum
                    .spec()
                    .post(path)
                    .withBody({ password: dto.password })
                    .expectStatus(400);
            });

            it('should throw if password is empty', () => {
                return pactum.spec().post(path).withBody({ email: dto.email }).expectStatus(400);
            });

            it('should throw if body is empty', () => {
                return pactum.spec().post(path).expectStatus(400);
            });
        });
    });

    describe('User', () => {
        describe('get me', () => {
            it('should throw without valid auth', () => {
                return pactum.spec().get('/users/me').expectStatus(401);
            });

            it('should get the current user', () => {
                return pactum
                    .spec()
                    .get('/users/me')
                    .withBearerToken(pactum.stash.getStoreKey('accessToken'))
                    .expectStatus(200)
                    .expectJsonLike({
                        name: 'Test User',
                        email: 'tryhackme@example.com',
                    })
                    .stores('userId', '_id');
            });
        });

        describe('edit user', () => {
            it('should edit the current user', () => {
                return pactum
                    .spec()
                    .patch('/users')
                    .withBearerToken(pactum.stash.getStoreKey('accessToken'))
                    .withBody({
                        name: 'Testing User',
                        email: 'tryhackmenow@example.com',
                    })
                    .expectStatus(200)
                    .expectJsonLike({
                        _id: '$S{userId}',
                        name: 'Testing User',
                        email: 'tryhackmenow@example.com',
                    });
            });
        });

        describe('get the edited user', () => {
            it('should return the updated user', () => {
                return pactum
                    .spec()
                    .get('/users/me')
                    .withBearerToken(pactum.stash.getStoreKey('accessToken'))
                    .expectStatus(200)
                    .expectJsonLike({
                        name: 'Testing User',
                        email: 'tryhackmenow@example.com',
                    });
            });
        });
    });

    describe('Tasks', () => {
        const path = '/tasks';
        const accessToken = pactum.stash.getStoreKey('accessToken');

        describe('get empty tasks', () => {
            it('should throw if not authenticated', () => {
                return pactum.spec().get(path).expectStatus(401);
            });

            it('should return an array with zero length', () => {
                return pactum
                    .spec()
                    .get(path)
                    .withBearerToken(accessToken)
                    .expectStatus(200)
                    .expectJsonLength(0);
            });
        });

        describe('create task', () => {
            const dto: AddTaskDto = {
                title: 'Test Task Title',
                description: 'This is my test task',
                status: TaskStatus.OPEN,
                createdAt: new Date(),
            };

            it('should create and return a task for the current user', () => {
                return pactum
                    .spec()
                    .post(path)
                    .withBearerToken(accessToken)
                    .withBody(dto)
                    .expectStatus(201)
                    .expectBodyContains(dto.title);
            });

            it('should create a task for the current user with a due date', () => {
                const dueAt = new Date();
                return pactum
                    .spec()
                    .post(path)
                    .withBearerToken(accessToken)
                    .withBody({ dueAt, ...dto })
                    .expectStatus(201)
                    .expectBodyContains(dueAt);
            });
        });

        describe('get tasks', () => {
            it('should return a set of two tasks', () => {
                return pactum
                    .spec()
                    .get(path)
                    .withBearerToken(accessToken)
                    .expectStatus(200)
                    .expectJsonLength(2)
                    .stores('taskId', '[0]._id');
            });
        });

        const invalidTaskId = '6570850b75d8acdd3467bf81';

        describe('get task by id', () => {
            it('should throw when task does not exist', () => {
                return pactum
                    .spec()
                    .get(`${path}/${invalidTaskId}`)
                    .withBearerToken(accessToken)
                    .expectStatus(404);
            });

            it('should return a task', () => {
                return pactum
                    .spec()
                    .get(`${path}/$S{taskId}`)
                    .withBearerToken(accessToken)
                    .expectStatus(200)
                    .expectBodyContains('Test Task Title');
            });
        });

        describe('edit task', () => {
            const dto: EditTaskDto = {
                title: 'Updated Test Task Title',
            };

            it('should change the title of the task', () => {
                return pactum
                    .spec()
                    .patch(`${path}/$S{taskId}`)
                    .withBearerToken(accessToken)
                    .withBody(dto)
                    .expectStatus(200)
                    .expectBodyContains(dto.title);
            });

            it('throw if the task does not exist', () => {
                return pactum
                    .spec()
                    .patch(`${path}/${invalidTaskId}`)
                    .withBearerToken(accessToken)
                    .withBody(dto)
                    .expectStatus(404);
            });
        });

        describe('delete task', () => {
            it('should throw if the task does not exist', () => {
                return pactum
                    .spec()
                    .delete(`${path}/${invalidTaskId}`)
                    .withBearerToken(accessToken)
                    .expectStatus(404);
            });

            it('should delete the task and return the deleted task', () => {
                return pactum
                    .spec()
                    .delete(`${path}/$S{taskId}`)
                    .withBearerToken(accessToken)
                    .expectStatus(200)
                    .expectBodyContains('Updated Test Task Title');
            });
        });

        describe('get deleted task', () => {
            it('should throw when getting the deleted task', () => {
                return pactum
                    .spec()
                    .get(`${path}/$S{taskId}`)
                    .withBearerToken(accessToken)
                    .expectStatus(404);
            });
        });
    });
});
