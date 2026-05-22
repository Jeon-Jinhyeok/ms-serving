# MS-Serving

클라우드 네이티브 마이크로서비스 기반 AI 모델 서빙 플랫폼

## 📁 서브 모듈 구성

| 디렉토리 이름     | 설명 |
|------------------|------|
| [infra](https://github.com/2025-PNU-CC-TERM-PROJECT/infra)        | Istio, Knative, KServe, 모니터링 도구를 포함한 Kubernetes 인프라 설치 스크립트 및 설정 파일 |
| [ms-backend](https://github.com/2025-PNU-CC-TERM-PROJECT/ms-backend)    | Spring Boot 기반 백엔드 서비스. PostgreSQL과 연동되며 REST API 및 AI 모델 요청 처리 담당 |
| inference-service | Node.js 기반 내부 추론 오케스트레이션 서비스. 백엔드 요청을 받아 이미지/텍스트 모델 서버 호출 담당 |
| [ms-frontend](https://github.com/2025-PNU-CC-TERM-PROJECT/ms-frontend)   | Next.js 기반 프론트엔드. Kubernetes 클러스터 바깥(Vercel, S3+CloudFront, 별도 Nginx 등)에 배포하고 Istio API 도메인을 호출 |

## 📚 목차 (Table of Contents)

- [A. 프로젝트 명](#a-프로젝트-명)
- [B. 프로젝트 멤버 및 담당 파트](#b-프로젝트-멤버-및-담당-파트)
- [C. 프로젝트 소개](#c-프로젝트-소개)
- [D. 프로젝트 필요성 소개](#d-프로젝트-필요성-소개)
- [E. 관련 기술 / 논문 / 특허 조사 내용 소개](#e-관련-기술--논문--특허-조사-내용-소개)
- [F. 프로젝트 개발 결과물 소개](#f-프로젝트-개발-결과물-소개)
  - [🗂️ 시스템 아키텍처 다이어그램](#️-시스템-아키텍처-다이어그램)
  - [⚙️ 주요 구성 요소 - Stack Overview](#️-주요-구성-요소---stack-overview)
  - [🔗 시연 영상 링크 - Demo](#-시연-영상-링크---Demo)
- [G. 개발 결과물 사용하는 방법](#g-개발-결과물-사용하는-방법)
  - [✅ 사전 준비 사항 (Prerequisites)](#-사전-준비-사항-prerequisites)
  - [🛠 설치 과정(Setup)](#-설치-과정setup)
  - [🌐 접속 방법 (Access URLs)](#-접속-방법-access-urls)
- [H. 개발 결과물 활용 방안](#h-개발-결과물-활용-방안)

---

## A. 프로젝트 명
**MS-Serving**  
(Cloud-native Microservice-based AI Model Serving Platform)

## B. 프로젝트 멤버 및 담당 파트

| 이름   | 이메일                    | GitHub               | 담당 파트 |
|--------|----------------------------|----------------------|-----------|
| 이광훈 | gbhuni@gmail.com           | [@khuni1](https://github.com/khuni1) | 배포 파일 구성, 쿠버네티스 인프라 구성 |
| 김예슬 | yesul0718@pusan.ac.kr      | [@yeseul-kim01](https://github.com/yeseul-kim01) | 웹 애플리케이션 개발, AI 모델 서빙  배포 파일 구성 |
| 전진혁 | aqwstn@gmail.com           | [@Jeon-Jinhyeok](https://github.com/Jeon-Jinhyeok) | 웹 애플리케이션 개발, 쿠버네티스 인프라 구성   |

## C. 프로젝트 소개

본 프로젝트는 **AI 모델을 클라우드 네이티브 환경에서 효율적으로 배포하고 서비스할 수 있는 플랫폼**을 구축하는 것을 목표로 한다.  
Kubernetes 기반 인프라 위에 KServe, Knative, Istio 등을 활용하여 확장성과 유연성을 제공한다.

## D. 프로젝트 필요성 소개

- 다양한 AI 모델 서빙 요구 증가
- 수요에 따른 오토스케일링 필요
- 안정적인 서비스 품질 보장 필요
- 마이크로서비스 아키텍처 기반 관리의 용이성

## E. 관련 기술 / 논문 / 특허 조사 내용 소개

- KServe: Model Serving용 Kubernetes Custom Resource
- Knative: Serverless Deployment 지원
- Istio: Service Mesh, Traffic Routing
- 참고 논문 및 기술 문서
    - [KServe 공식 문서](https://kserve.github.io/website/latest/)
    - [Knative Docs](https://knative.dev/docs/)
    - [Istio Docs](https://istio.io/latest/docs/)
    - [Service Mesh in Kubernetes: Implementing Istio for Enhanced Observability and Security](https://jsaer.com/download/vol-8-iss-11-2021/JSAER2021-8-11-200-206.pdf)
    - [Envoy 및 Istio 기반의 완전 관리형 서비스 메시](https://cloud.google.com/products/service-mesh)
    - [Red Hat OpenShift Service Mesh](https://www.redhat.com/en/technologies/cloud-computing/openshift/what-is-openshift-service-mesh)



## F. 프로젝트 개발 결과물 소개

### 🗂️ 시스템 아키텍처 다이어그램
![시스템 아키텍처](assets/systemArc.png)

### ⚙️ 주요 구성 요소 - Stack Overview

| 🧱 구성 요소 | 📋 설명 |
|-------------|---------|
| 📦 **KServe** | 머신러닝 모델 서빙을 위한 Kubernetes CRD 플랫폼 |
| 🚀 **Knative** | 서버리스 기능 제공 (auto-scaling, scale-to-zero) |
| 🌐 **Istio** | 서비스 메시, 트래픽 라우팅 및 보안 관리 |
| 🧩 **Spring Boot** | 백엔드 API 서버 |
| 🧠 **Inference Service** | 모델 서버 호출 전담 내부 마이크로서비스 |
| 🎨 **Next.js** | 사용자 프론트엔드 UI |

### 🔗 시연 영상 링크 - Demo
| 🔗 링크 | 📋 설명 |
|-------------|---------|
| 📦 [admin_demo](https://youtu.be/Da7VeaPqOzI) | 관리자 기능 - serverless , auto-scaling |
| 🚀 [user_demo](https://youtu.be/BS88TTxOUJs) | 웹 클라이언트 인터페이스 |

## G. 개발 결과물 사용하는 방법

### ✅ 사전 준비 사항 (Prerequisites)

1. 아래의 SW가 **사전 설치**되어 있어야 합니다:
- [Node.js & npm](https://nodejs.org/)
- [Docker](https://www.docker.com/)  
- [kubectl](https://kubernetes.io/docs/tasks/tools/)  
- [Helm](https://helm.sh/docs/intro/install/)

설치 여부 확인 예시:
```bash
node -v && npm -v
docker -v
kubectl version --client
helm version
```
> Docker에 login되어 있어야 합니다.

2. 쿠버네티스 클러스터가 설정되어있어야 합니다. ex) GKE, EKS
> auto-pilot 모드에서는 실행되지 않습니다.
---

### 🛠 설치 과정(Setup)
```bash
1. 저장소 클론 (서브모듈 포함)
git clone --recurse-submodules https://github.com/2025-PNU-CC-TERM-PROJECT/ms-serving.git

2. 인프라 디렉토리로 이동
cd ./ms-serving/infra

3. 도커 레지스트리 환경변수 설정
export DOCKER_REGISTRY=your-dockerhub-username

4. 설치 스크립트 실행
./setup.sh

```

---

### 🌐 접속 방법 (Access URLs)

#### 🖥️ 프론트엔드

- **Frontend App**:  
  클러스터 바깥에 별도로 배포합니다. 배포 시 `NEXT_PUBLIC_API_URL`을 `http://api.{MAGIC_DOMAIN}` 또는 운영 API 도메인으로 설정합니다.
> `MAGIC_DOMAIN` 값은 클러스터 외부 IP 또는 도메인 설정에 따라 자동 할당됩니다.
---

#### 🌐 API Gateway

- **API Gateway**:  
  [`http://api.{MAGIC_DOMAIN}`](http://api.{MAGIC_DOMAIN})
---

#### 🤖 AI 서비스

| 서비스 종류 | URL |
|-------------|-----|
| AI Image 서비스 | [`http://ai-image-serving.ms-models.${MAGIC_DOMAIN}/v1/models/mobilenet:predict`](http://ai-image-serving.ms-models.${MAGIC_DOMAIN}/v1/models/mobilenet:predict) |
| AI Text 서비스 | [`http://ai-text-serving.ms-models.${MAGIC_DOMAIN}/v1/models/kobart-summary:predict`](http://ai-text-serving.ms-models.${MAGIC_DOMAIN}/v1/models/kobart-summary:predict) |
> 해당 url에 curl로 요청을 보낼 수도 있습니다.
---

#### 📊 모니터링 도구

| 도구 | URL |
|------|-----|
| **Kiali (서비스 메시 시각화)** | [`http://kiali.${MAGIC_DOMAIN}`](http://kiali.${MAGIC_DOMAIN}) |
| **Prometheus (메트릭 수집)** | [`http://prometheus.${MAGIC_DOMAIN}`](http://prometheus.${MAGIC_DOMAIN}) |
| **Grafana (대시보드 시각화)** | [`http://grafana.${MAGIC_DOMAIN}`](http://grafana.${MAGIC_DOMAIN}) |
| **Jaeger (트레이싱 분석)** | [`http://jaeger.${MAGIC_DOMAIN}`](http://jaeger.${MAGIC_DOMAIN}) |

## H. 개발 결과물 활용 방안

본 시스템은 다양한 산업 분야에서 요구되는 고신뢰성 · 고확장성 · 고관찰성을 갖춘 AI 서빙 인프라로서 다음과 같은 방식으로 활용될 수 있다.

- MLOps 기반 AI 모델 게이트웨이
다양한 팀 또는 외부 애플리케이션에 AI 기능을 안전하게 공개
Canary 배포를 통해 서비스 중단 없이 모델 실험 및 교체 가능

- 의료 영상 분석 및 진단
보안 민감 데이터를 기반으로 하는 AI 모델 (예: CT/MRI 영상 분석, 병리 조직 이미지 분석 등)을 다루는 환경에 적용
보안 정책과 인증 체계를 강화하여 안전한 서빙 환경 제공

- 금융 거래 분석 및 서비스 품질 유지
실시간 이상 거래 탐지, 신용 리스크 평가 등의 AI 모델을 지속적으로 업데이트하며 서비스 제공
트래픽 폭주 시 자동 확장(Auto-Scaling) 기능을 통해 안정적인 서비스 품질 유지


