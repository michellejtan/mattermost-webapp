// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useEffect, useMemo} from 'react';
import {useSelector} from 'react-redux';
import {FormattedMessage, useIntl} from 'react-intl';

import moment from 'moment';

import {trackEvent} from 'actions/telemetry_actions';

import {ConsolePages, ModalIdentifiers, TELEMETRY_CATEGORIES} from 'utils/constants';

import {getLicense} from 'mattermost-redux/selectors/entities/general';

import {isModalOpen} from 'selectors/views/modals';
import {GlobalState} from 'types/store';

import Carousel from 'components/common/carousel/carousel';
import GenericModal from 'components/generic_modal';
import HandsSvg from 'components/common/svg_images_components/hands_svg';
import GuestAccessSvg from 'components/common/svg_images_components/guest_access_svg';
import MonitorImacLikeSVG from 'components/common/svg_images_components/monitor_imaclike_svg';
import SystemRolesSVG from 'components/admin_console/feature_discovery/features/images/system_roles_svg';
import PersonWithChecklistSvg from 'components/common/svg_images_components/person_with_checklist';
import BlockableLink from 'components/admin_console/blockable_link';

import TrialBenefitsModalStep, {TrialBenefitsModalStepProps} from './trial_benefits_modal_step';

import './trial_benefits_modal.scss';

export type Props = {
    onClose?: () => void;
    onExited: () => void;
    trialJustStarted?: boolean;
}

const TrialBenefitsModal = ({
    onClose,
    onExited,
    trialJustStarted,
}: Props): JSX.Element | null => {
    const {formatMessage} = useIntl();

    const license = useSelector((state: GlobalState) => getLicense(state));
    const show = useSelector((state: GlobalState) => isModalOpen(state, ModalIdentifiers.TRIAL_BENEFITS_MODAL));
    const isCloud = license?.Cloud === 'true';

    useEffect(() => {
        if (!trialJustStarted) {
            trackEvent(
                TELEMETRY_CATEGORIES.SELF_HOSTED_START_TRIAL_MODAL,
                'benefits_modal_post_enterprise_view',
            );
        }
    }, []);

    // by default all licence last 30 days plus 8 hours. We use this value as a fallback for the trial license duration information shown in the modal
    const trialLicenseDuration = (1000 * 60 * 60 * 24 * 30) + (1000 * 60 * 60 * 8);
    const trialEndDate = moment.unix((Number(license?.ExpiresAt) || new Date(Date.now()).getTime() + trialLicenseDuration) / 1000).format('MMMM,DD,YYYY');

    const buttonLabel = formatMessage({id: 'learn_more_trial_modal_step.learnMoreAboutFeature', defaultMessage: 'Learn more about this feature.'});

    const steps: TrialBenefitsModalStepProps[] = useMemo(() => [
        {
            id: 'useSso',
            title: formatMessage({id: 'learn_more_about_trial.modal.useSsoTitle', defaultMessage: 'Use SSO (with OpenID, SAML, Google, O365)'}),
            description: formatMessage({id: 'learn_more_about_trial.modal.useSsoDescription', defaultMessage: 'Sign on quickly and easily with our SSO feature that works with OpenID, SAML, Google, and O365.'}),
            svgWrapperClassName: 'guestAccessSvg',
            svgElement: (
                <GuestAccessSvg
                    width={400}
                    height={180}
                />
            ),
            pageURL: 'https://docs.mattermost.com/onboard/sso-saml.html',
            buttonLabel,
        },
        {
            id: 'ldap',
            title: formatMessage({id: 'learn_more_about_trial.modal.ldapTitle', defaultMessage: 'Synchronize your Active Directory/LDAP groups'}),
            description: formatMessage({id: 'learn_more_about_trial.modal.ldapDescription', defaultMessage: 'Use AD/LDAP groups to organize and apply actions to multiple users at once. Manage team and channel memberships, permissions and more.'}),
            svgWrapperClassName: 'personMacSvg',
            svgElement: (
                <MonitorImacLikeSVG
                    width={400}
                    height={180}
                />
            ),
            pageURL: 'https://docs.mattermost.com/onboard/ad-ldap.html',
            buttonLabel,
        },
        {
            id: 'systemConsole',
            title: formatMessage({id: 'learn_more_about_trial.modal.systemConsoleTitle', defaultMessage: 'Provide controlled access to the System Console'}),
            description: formatMessage({id: 'learn_more_about_trial.modal.systemConsoleDescription', defaultMessage: 'Use System Roles to give designated users read and/or write access to select sections of System Console.'}),
            svgWrapperClassName: 'personBoxSvg',
            svgElement: (
                <SystemRolesSVG
                    width={400}
                    height={180}
                />
            ),
            pageURL: ConsolePages.LICENSE,
            buttonLabel,
        },
        {
            id: 'playbooks',
            title: formatMessage({id: 'trial_benefits.modal.playbooksTitle', defaultMessage: 'Playbooks get superpowers'}),
            description: formatMessage({id: 'trial_benefits.modal.playbooksDescription', defaultMessage: 'Create private playbooks, manage granular permissions schemes, and track custom metrics with a dedicated dashboard.'}),
            svgWrapperClassName: 'personSheetSvg',
            svgElement: (
                <PersonWithChecklistSvg
                    width={250}
                    height={200}
                />
            ),
            pageURL: '/playbooks/start',
            buttonLabel: formatMessage({id: 'trial_benefits.modal.playbooksButton', defaultMessage: 'Open Playbooks'}),
        },
    ], []);

    let trialJustStartedTitle = formatMessage({id: 'trial_benefits.modal.trialStartTitle', defaultMessage: 'Your trial has started! Explore the benefits of Enterprise'});

    if (isCloud) {
        trialJustStartedTitle = formatMessage({id: 'trial_benefits.modal.trialStartTitleCloud', defaultMessage: 'Your trial has started!'});
    }

    // declares the content shown just after the trial has started
    const trialJustStartedDeclaration = {
        id: 'trialStart',
        title: trialJustStartedTitle,
        description: (
            <>
                <FormattedMessage
                    id='trial_benefits.modal.trialStartedDescriptionIntro'
                    defaultMessage='Welcome to your Mattermost Enterprise trial! It expires on {trialExpirationDate}. '
                    values={{
                        trialExpirationDate: trialEndDate,
                    }}
                />
                <FormattedMessage
                    id='trial_benefits.modal.trialStartedDescriptionBody'
                    defaultMessage='You now have access to <guestAccountsLink>guest accounts</guestAccountsLink>, <autoComplianceReportsLink>automated compliance reports</autoComplianceReportsLink>, and <mobileSecureNotificationsLink>mobile secure-ID push notifications</mobileSecureNotificationsLink>, among many other features.'
                    values={{
                        guestAccountsLink: (text: string) => (
                            <BlockableLink
                                to={ConsolePages.GUEST_ACCOUNTS}
                                onClick={handleOnClose}
                            >
                                {text}
                            </BlockableLink>
                        ),
                        autoComplianceReportsLink: (text: string) => (
                            <BlockableLink
                                to={ConsolePages.COMPLIANCE_EXPORT}
                                onClick={handleOnClose}
                            >
                                {text}
                            </BlockableLink>
                        ),
                        mobileSecureNotificationsLink: (text: string) => (
                            <BlockableLink
                                to={ConsolePages.PUSH_NOTIFICATION_CENTER}
                                onClick={handleOnClose}
                            >
                                {text}
                            </BlockableLink>
                        ),
                    }}
                />
            </>
        ),
        svgWrapperClassName: 'handsSvg',
        svgElement: (
            <HandsSvg
                width={200}
                height={100}
            />
        ),
        bottomLeftMessage: formatMessage({id: 'trial_benefits.modal.onlyVisibleToAdmins', defaultMessage: 'Only visible to admins'}),
        isCloud,
    };

    const handleOnClose = useCallback(() => {
        if (onClose) {
            onClose();
        }

        onExited();
    }, [onClose, onExited]);

    const handleOnPrevNextSlideClick = useCallback((slideIndex: number) => {
        const slideId = steps[slideIndex - 1]?.id;

        if (slideId) {
            trackEvent(
                TELEMETRY_CATEGORIES.SELF_HOSTED_START_TRIAL_MODAL,
                'benefits_modal_slide_shown_' + slideId,
            );
        }
    }, [steps]);

    const getSlides = useCallback(() => steps.map(({id, ...rest}) => (
        <TrialBenefitsModalStep
            {...rest}
            id={id}
            key={id}
            onClose={handleOnClose}
        />
    )), [steps, handleOnClose]);

    const trialJustStartedScreen = ({
        id,
        title,
        description,
        svgWrapperClassName,
        svgElement,
        bottomLeftMessage,
        isCloud,
    }: TrialBenefitsModalStepProps) => {
        // when we are in cloud, ommit the cta to go to the system console, this because the license changes take some time to get applied (see MM-44463)
        // also, the design of the modal changes a little bit by placing the svg image on top and the title changes too.
        return (
            <div
                id={`trialBenefitsModalStarted-${id}`}
                className='TrialBenefitsModalStep trial-just-started slide-container'
            >
                {isCloud && <div className={`${svgWrapperClassName} svg-wrapper`}>
                    {svgElement}
                </div>}
                <div className='title'>
                    {title}
                </div>
                <div className='description'>
                    {description}
                </div>
                {!isCloud && <div className={`${svgWrapperClassName} svg-wrapper`}>
                    {svgElement}
                </div>}
                <div className='buttons-section-wrapper'>
                    <a
                        className={`${isCloud ? 'primary-button' : 'tertiary-button'}`}
                        onClick={handleOnClose}
                    >
                        <FormattedMessage
                            id='trial_benefits_modal.trial_just_started.buttons.close'
                            defaultMessage='Close'
                        />
                    </a>
                    {!isCloud &&
                        <BlockableLink
                            className='primary-button'
                            to={ConsolePages.GUEST_ACCOUNTS}
                            onClick={handleOnClose}
                        >
                            <FormattedMessage
                                id='trial_benefits_modal.trial_just_started.buttons.setUp'
                                defaultMessage='Set up system console'
                            />
                        </BlockableLink>
                    }
                </div>
                {bottomLeftMessage && (
                    <div className='bottom-text-left-message'>
                        {bottomLeftMessage}
                    </div>
                )}
            </div>
        );
    };

    const content = () => {
        if (trialJustStarted) {
            return trialJustStartedScreen(trialJustStartedDeclaration);
        }
        return (
            <Carousel
                dataSlides={getSlides()}
                id={'trialBenefitsModalCarousel'}
                infiniteSlide={false}
                onNextSlideClick={handleOnPrevNextSlideClick}
                onPrevSlideClick={handleOnPrevNextSlideClick}
            />
        );
    };

    return (
        <GenericModal
            className='TrialBenefitsModal'
            show={show}
            id='trialBenefitsModal'
            onExited={handleOnClose}
        >
            {content()}
        </GenericModal>
    );
};

export default TrialBenefitsModal;
