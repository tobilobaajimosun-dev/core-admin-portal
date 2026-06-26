/**
* Copyright (c) 2024 Princeps Credit Systems Limited
*
* This code is the property of Princeps Credit Systems Limited. Unauthorized copying,
* sharing, or use of this code, via any medium, is strictly prohibited
* without express permission from Princeps Credit Systems Limited.
*
* @author     Michael Ashefor
* @license    Proprietary
* @version    1.0.0
* @link       https://www.princepscreditsystemslimited.com
*/

import { HttpClient, provideHttpClient, withInterceptors } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { jwtInterceptor } from "./jwt.interceptor";
import { TestBed } from "@angular/core/testing";
import { LocalStorageService } from "../services/storage";
import { AuthService } from "../services/auth.service";
import { TestScheduler } from "rxjs/testing";

describe('jwtInterceptor', () => {
  let httpTestingController: HttpTestingController;
  let httpClient: HttpClient;
  let testScheduler: TestScheduler;

  beforeEach(() => {
    TestBed.configureTestingModule({
      // here are the KEY changes
      providers: [
        provideHttpClient(withInterceptors([jwtInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    httpTestingController = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
    testScheduler = new TestScheduler((act, exp) => expect(exp).toEqual(act) as any);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(jwtInterceptor).toBeTruthy();
  });

  // it('should add token to header if authenticated', () => {
  //   const service = new LocalStorageService();
  //   const authService = TestBed.inject(AuthService);
  //   const token = service.getToken();
  //   const isRequestAuthorized = authService.isAuthenticated && !!token;

  //   if (isRequestAuthorized) {
  //     const headers = { Authorization: `Bearer ${token}` };
  //     httpClient.get('url', { headers }).subscribe();
  //     const req = httpTestingController.expectOne('url');
  //     expect(req.request.headers.get('Authorization')).toEqual(`Bearer ${token}`);
  //   } else {
  //     httpClient.get('url').subscribe();
  //     const req = httpTestingController.expectOne('url');
  //     expect(req.request.headers.get('Authorization')).toBeNull();
  //   }
  // });
})
