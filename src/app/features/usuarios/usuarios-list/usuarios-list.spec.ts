import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { UsuariosList } from './usuarios-list';
import { UserService } from '../../../core/services/user.service';

describe('UsuariosList', () => {
  let component: UsuariosList;
  let fixture: ComponentFixture<UsuariosList>;
  let mockUserService: any;

  beforeEach(async () => {
    mockUserService = {
      getUsers: () => of([]),
      getRoles: () => of([]),
      createUser: () => of({}),
      updateUser: () => of({}),
      deleteUser: () => of(undefined)
    };

    await TestBed.configureTestingModule({
      imports: [UsuariosList],
      providers: [
        { provide: UserService, useValue: mockUserService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UsuariosList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
